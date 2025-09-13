/* eslint-disable require-await */
import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { Queue, Worker, Job, JobState } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { TasksCrudDtos } from "$shared/models/tasks";
import { v4 as uuidv4 } from "uuid";
import { assertIsDefined } from "$shared/utils/validation";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { assertFoundServer } from "#utils/validation/found";
import { taskRegistry } from "./task.registry";

const defaultOptions: TasksCrudDtos.CreateTask.TaskOptions = {
  delay: 0,
  attempts: 3,
  priority: 1,
};

export const QUEUE_NAME = "single-tasks";

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
      async (job: Job) => {
        return await this.processJob(job);
      },
      {
        connection: this.queue.opts.connection,
      },
    );
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
    // Validate that handler exists
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

  async getTaskStatus(
    jobId: string,
  ): Promise<any> {
    const job = await this.queue.getJob(jobId);

    assertFoundServer(job, `Task with ID "${jobId}" not found`);

    const state = await job.getState();

    return adaptToTaskStatus(job, state);
  }

  private async processJob(job: Job): Promise<TasksCrudDtos.TaskStatus.TaskStatus> {
    const handler = taskRegistry.get(job.name);

    if (!handler)
      throw new Error(`Handler for task "${job.name}" not found`);

    this.logger.log(`Processing task: ${job.name} with ID: ${job.id}`);

    return handler.execute(job.data, job);
  }

  private async getLatestJobs(queue: Queue, n: number = 10) {
    return (await queue.getJobs([], 0, n - 1))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, n);
  }

  async getQueueStatus(n: number = 10) {
    const jobs = await this.getLatestJobs(this.queue, n);
    const states: (JobState | "unknown")[] = [];

    for (const j of jobs)
      states.push(await j.getState());

    return jobs.map((_, i)=>adaptToTaskStatus(jobs[i], states[i]));
  }

  async getQueueIds(n: number = 10) {
    const jobs = await this.getLatestJobs(this.queue, n);

    return jobs.map((j)=>{
      const { id } = j;

      assertIsDefined(id);

      return id;
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

  const progress = TasksCrudDtos.TaskStatus.progressSchemaBase.parse(job.progress);

  return {
    id: job.id!,
    name: job.name!,
    status: state,
    payload: job.data,
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
