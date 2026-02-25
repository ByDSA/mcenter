/* eslint-disable require-await */
import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { Queue, Worker, Job, JobState, DelayedError } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import { v4 as uuidv4 } from "uuid";
import { assertIsDefined } from "$shared/utils/validation";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { assertFoundServer } from "#utils/validation/found";
import { showError } from "#core/logging/show-error";
import { taskRegistry } from "./task.registry";
import { TaskCancelledError, TaskPausedError, TaskSignal } from "./signals";

type StopJobCheckerOptions = {
  onPause?: ()=> Promise<void>;
};

const PAUSED_JOB_TIMESTAMP = Number.MAX_SAFE_INTEGER;
const defaultOptions: TasksCrudDtos.CreateTask.TaskOptions = {
  delay: 0,
  attempts: 3,
  priority: 1,
};

export const QUEUE_NAME = "mcenter-tasks-main";

async function fixVersion(queue: Queue, worker: Worker) {
  // Nota: si se cambia el nombre de la QUEUE, puede dar errores de que "no encuentra la versión".
  // Eso es porque se crea un nuevo worker, conviven el del viejo nombre y el nuevo.
  // Script para fusionar colas:
  /*
  OLD=single-tasks
  NEW=mcenter-tasks-main

  docker exec mcenter_redis redis-cli KEYS "bull:${OLD}:*" | while read key; do
    new_key=$(echo $key | sed "s/${OLD}/${NEW}/")
    docker exec mcenter_redis redis-cli RENAME "$key" "$new_key" && echo "✓ $key -> $new_key"
  done
  */

  if (!queue.redisVersion) {
    const client = await worker.client;
    const info = await client.info("server");
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);

    // eslint-disable-next-line accessor-pairs
    Object.defineProperty(queue, "redisVersion", {
      get() { return versionMatch?.[1]; },
      configurable: true,
    } );
  }

  assertIsDefined(queue.redisVersion, "Versión de redis no definida");
}

@Injectable()
export class SingleTasksService extends EventEmitter2 {
  private readonly logger = new Logger(SingleTasksService.name);

  private worker: Worker;

  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
  ) {
    super();

    this.worker = new Worker(
      QUEUE_NAME,
      // El token es necesario para poder llamar job.moveToDelayed() en la pausa.
      async (job: Job, token?: string) => {
        return await this.processJob(job, token);
      },
      {
        connection: this.queue.opts.connection,
      },
    );

    fixVersion(queue, this.worker)
      .catch(showError);

    this.logger.log("New worker created.");
    this.logger.log("Task service initialized");

    this.worker.on("completed", (job) => {
      this.logger.log(`Task ${job.name} completed with ID: ${job.id}`);
      this.emit("task-change", job.id);
    } );

    this.worker.on("failed", (job, err) => {
      this.logger.error(
        `Task ${job?.name} failed with ID: ${job?.id}`,
        JSON.stringify(err, null, 2),
      );

      if (job?.id)
        this.emit("task-change", job.id);
    } );

    this.worker.on("progress", (job, _progress) => {
      if (job.id)
        this.emit("task-change", job.id);
    } );

    this.worker.on("active", (job) => {
      if (job.id)
        this.emit("task-change", job.id);
    } );
  }

  // ─── Señales de control (Redis) ─────────────────────────────────────────────
  private async getRedisClient() {
    return this.worker.client;
  }

  private signalKey(jobId: string) {
    return `job:${jobId}:signal`;
  }

  /**
   * Lee la señal pendiente para un job.
   * Llamado por los handlers a través de stopJobChecker().
   */
  private async checkSignal(jobId: string): Promise<TaskSignal | null> {
    const client = await this.getRedisClient();
    const val = await client.get(this.signalKey(jobId));

    return val as TaskSignal | null;
  }

  /**
   * Limpia la señal una vez procesada.
   */
  private async clearSignal(jobId: string): Promise<void> {
    const client = await this.getRedisClient();

    await client.del(this.signalKey(jobId));
  }

  private async writeSignal(jobId: string, signal: TaskSignal): Promise<void> {
    const client = await this.getRedisClient();

    await client.set(this.signalKey(jobId), signal, "EX", 3600);
  }

  // ─── API pública de control ──────────────────────────────────────────────────
  /**
   * KILL: manda señal "kill" → stopJobChecker la detecta en el siguiente
   * checkpoint y lanza TaskCancelledError (UnrecoverableError) → job queda
   * como `failed` sin reintentos.
   */
  async killJob(jobId: string): Promise<void> {
    await this.assertJobIsState(jobId, ["active", "delayed", "waiting", "prioritized"]);
    await this.writeSignal(jobId, "kill");
    this.logger.log(`Kill signal sent to job ${jobId}`);
  }

  /**
   * PAUSA: manda señal "pause" → stopJobChecker la detecta en el siguiente
   * checkpoint, llama a onPause() para guardar el checkpoint, y lanza
   * TaskPausedError → processJob mueve el job a `delayed` (mismo ID).
   *
   * El job queda en estado `delayed` indefinidamente hasta que se llame resumeJob().
   */
  async pauseJob(jobId: string): Promise<void> {
    await this.assertJobIsState(jobId, ["active"]);
    await this.writeSignal(jobId, "pause");
    this.logger.log(`Pause signal sent to job ${jobId}`);
  }

  /**
   * Reanuda un job previamente pausado (estado `delayed`).
   * El job mantiene el mismo ID y su _internal intacto.
   */
  async resumeJob(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);

    assertFoundServer(job, `Job ${jobId} not found`);

    const state = await job.getState();

    if (state !== "delayed") {
      throw new UnprocessableEntityException(
        `Job ${jobId} no está pausado (estado actual: ${state})`,
      );
    }

    await job.promote();
    const { _paused, ...newData } = job.data;

    await job.updateData(newData);
    this.logger.log(`Job ${jobId} resumed`);
    this.emit("task-change", jobId);
  }

  // ─── Helper de checkpoint para handlers ─────────────────────────────────────
  /**
   * Debe llamarse en cada checkpoint del handler (inicio de cada iteración,
   * entre pasos pesados, etc.).
   *
   * - Si hay señal "kill": lanza TaskCancelledError (UnrecoverableError, no reintenta).
   * - Si hay señal "pause": llama a onPause() para guardar el checkpoint,
   *   luego lanza TaskPausedError → processJob mueve el job a delayed.
   * - Si no hay señal: no hace nada y retorna.
   *
   * El handler NO necesita comprobar el valor de retorno ni hacer nada más.
   */
  async stopJobChecker(job: Job, options?: StopJobCheckerOptions): Promise<void> {
    assertIsDefined(job.id);
    const signal = await this.checkSignal(job.id!);

    if (signal === "kill") {
      await this.clearSignal(job.id!);
      throw new TaskCancelledError(job.id!);
    }

    if (signal === "pause") {
      await this.clearSignal(job.id!);
      await job.updateData( {
        ...job.data,
        _paused: true,
      } );

      if (options?.onPause)
        await options.onPause();

      throw new TaskPausedError(job.id!);
    }
  }

  private async assertJobIsState(
    jobId: string,
    expectedStates: (JobState | "unknown"
  )[],
  ): Promise<void> {
    const job = await this.queue.getJob(jobId);

    assertFoundServer(job, `Job ${jobId} not found`);

    const state = await job.getState();

    if (!expectedStates.includes(state))
      throw new UnprocessableEntityException(`Job ${jobId} no está activo (estado: ${state})`);
  }

  async isJobRunningOrPendingByName(name: string): Promise<boolean> {
    // Verificar cada estado por separado y retornar tan pronto como encontremos una coincidencia
    // Primero verificar activos (más probable que sean pocos)
    const activeJobs = await this.queue.getActive();

    if (activeJobs.some(job => job.name === name))
      return true;

    // Luego verificar en espera
    const waitingJobs = await this.queue.getWaiting();

    if (waitingJobs.some(job => job.name === name))
      return true;

    // Verificar trabajos retrasados/programados
    const delayedJobs = await this.queue.getDelayed();

    if (delayedJobs.some(job => job.name === name))
      return true;

    return false;
  }

  async assertJobIsNotRunningOrPendingByName(name: string) {
    if (await this.isJobRunningOrPendingByName(name)) {
      const err = new UnprocessableEntityException();

      err.message = "La tarea " + name + " ya se estaba ejecutando o está en la cola.";
      throw err;
    }
  }

  async addTask<T>(
    name: string,
    payload: T,
    options: Partial<TasksCrudDtos.CreateTask.TaskOptions> = defaultOptions,
  ): Promise<TasksCrudDtos.CreateTask.TaskJob<T>> {
    const handler = taskRegistry.get(name);

    if (!handler) {
      const message = `Task handler "${name}" not found`;

      this.logger.error(message);
      throw new Error(message);
    }

    const job = await this.queue.add(
      name,
      payload,
      {
        removeOnFail: false, // Para que llame el onFail tras el último intento
        ...TasksCrudDtos.CreateTask.taskOptionsSchema.parse( {
          attempts: options.attempts ?? defaultOptions.attempts,
          delay: options.delay ?? defaultOptions.delay,
          priority: options.priority ?? defaultOptions.priority,
          jobId: options.jobId ?? uuidv4(),
        } satisfies TasksCrudDtos.CreateTask.TaskOptions),
      },
    );

    return {
      id: job.id!,
      name: job.name!,
      payload: job.data,
      createdAt: new Date(),
    };
  }

  async getTaskStatus(jobId: string): Promise<any> {
    const job = await this.queue.getJob(jobId);

    assertFoundServer(job, `Task with ID "${jobId}" not found`);

    const state = await job.getState();

    return adaptToTaskStatus(job, state);
  }

  /**
   * Ejecuta el job e intercepta TaskPausedError para mover el job a `delayed`
   * con el mismo ID en lugar de crear uno nuevo.
   * El token es necesario para que moveToDelayed valide el lock del worker.
   */
  private async processJob(job: Job, token?: string): Promise<any> {
    const handler = taskRegistry.get(job.name);

    if (!handler)
      throw new Error(`Handler for task "${job.name}" not found`);

    this.logger.log(`Processing task: ${job.name} with ID: ${job.id}`);

    try {
      return await handler.execute(job.data, job);
    } catch (err) {
      if (err instanceof TaskPausedError) {
        // El handler ya guardó el checkpoint en job.data via job.updateData() (en onPause).
        // Movemos el mismo job a delayed (mismo ID, sin crear uno nuevo).
        // DelayedError indica a BullMQ que no marque el job como failed/completed.
        await job.moveToDelayed(PAUSED_JOB_TIMESTAMP, token);
        this.logger.log(`Job ${job.id} paused and moved to delayed (same ID)`);
        this.emit("task-change", job.id);

        throw new DelayedError();
      }

      throw err;
    } finally {
      // Limpiamos la señal del redis en cualquier caso (completado, fallado, pausado)
      // eslint-disable-next-line no-empty-function
      await this.clearSignal(job.id!).catch(() => {} );
    }
  }

  private async getLatestJobs(queue: Queue, n: number = 10) {
    return (await queue.getJobs([], 0, n - 1))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, n);
  }

  async getQueueStatus(n: number = 10) {
    const jobs = await this.getLatestJobs(this.queue, n);
    const states: (JobState | "unknown")[] = [];

    for (const j of jobs) {
      try {
        const state = await j.getState();

        states.push(state);
      } catch (e) {
        const ctx = {
          job: j.asJSON(),
        };

        this.logger.debug("Error getting job state. Context: " + JSON.stringify(ctx, null, 2));
        throw e;
      }
    }

    return jobs.map((_, i) => adaptToTaskStatus(jobs[i], states[i]));
  }

  async getQueueIds(n: number = 10) {
    const jobs = await this.getLatestJobs(this.queue, n);

    return jobs.map((j) => {
      const { id } = j;

      assertIsDefined(id);

      return id;
    } );
  }

  updateInternal<I extends object>(
    job: JobWithInternal<I>,
    fn: (old?: I)=> I,
  ) {
  // eslint-disable-next-line no-underscore-dangle
    const _internal: I = job.data._internal ? fn(job.data._internal) : fn();

    return job.updateData( {
      ...job.data,
      _internal,
    } );
  }
}

function adaptToTaskStatus(
  job: Job,
  state: JobState | "unknown",
): TasksCrudDtos.TaskStatus.TaskStatus<any> {
  if (typeof job.progress === "number") {
    job.progress = {
      percentage: job.progress,
      message: "",
    } as TasksCrudDtos.TaskStatus.ProgressBase;
  }

  const progress = TasksCrudDtos.TaskStatus.progressSchemaBase
    .passthrough()
    .parse(job.progress);
  let cleanData = job.data;

  if ("_internal" in cleanData) {
    const { _internal, ...tmp } = cleanData;

    cleanData = tmp;
  }

  return {
    id: job.id!,
    name: job.name!,
    status: state,
    payload: cleanData,
    progress,
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
    failedReason: job.failedReason ?? undefined,
    returnValue: job.returnvalue ?? undefined,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts ?? 3,
  };
}

export type JobWithInternal<I> = Job & {
  data: {
    _internal: I;
  };
};
