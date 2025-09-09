/* eslint-disable require-await */
import type { AnyTaskHandler } from "./task.interface";
import EventEmitter from "node:events";
import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Queue, Worker, Job } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { DiscoveryService } from "@nestjs/core";
import { v4 as uuidv4 } from "uuid";
import { TasksCrudDtos } from "$shared/models/tasks";
import { assertFoundServer } from "#utils/validation/found";
import { taskRegistry } from "./task.registry";
import { TASK_HANDLER_METADATA } from "./task-handler.decorator";

const defaultOptions: TasksCrudDtos.CreateTask.TaskOptions = {
  delay: 0,
  attempts: 3,
  priority: 1,
};

@Injectable()
export class TaskService extends EventEmitter
  implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);

  private worker: Worker;

  constructor(
  @InjectQueue("tasks") private readonly queue: Queue,
  private readonly discoveryService: DiscoveryService,
  ) {
    super();
    this.worker = new Worker(
      "tasks",
      async (job: Job) => {
        return this.processJob(job);
      },
      {
        connection: this.queue.opts.connection,
      },
    );
  }

  async onModuleInit() {
    // Auto-discover y registrar handlers
    await this.discoverAndRegisterHandlers();

    this.logger.log("Task service initialized");
    this.worker.on("completed", (job) => {
      this.logger.log(`Task ${job.name} completed with ID: ${job.id}`);

      this.emit("task-change", job.id);
    } );

    this.worker.on("failed", (job, err) => {
      this.logger.error(`Task ${job?.name} failed with ID: ${job?.id}`, err);

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

  private async discoverAndRegisterHandlers() {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;

      if (!instance)
        continue;

      const isTaskHandler = Reflect.getMetadata(TASK_HANDLER_METADATA, instance.constructor);

      if (isTaskHandler && this.isTaskHandler(instance)) {
        taskRegistry.register(instance as AnyTaskHandler);
        this.logger.log(`Registered task handler: ${instance.taskName}`);
      }
    }
  }

  private isTaskHandler(instance: AnyTaskHandler): instance is AnyTaskHandler {
    return (
      typeof instance.taskName === "string"
      && typeof instance.execute === "function"
    );
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
        ...TasksCrudDtos.CreateTask.taskOptionsSchema.parse( {
          attempts: options.attempts ?? defaultOptions.attempts,
          delay: options.delay ?? defaultOptions.delay,
          priority: options.priority ?? defaultOptions.priority,
        } satisfies TasksCrudDtos.CreateTask.TaskOptions),
        removeOnFail: false, // Para que llame el onFail tras el último intento
        jobId: uuidv4(),
      },
    );

    return {
      id: job.id!,
      name: job.name!,
      payload: job.data,
      createdAt: new Date(),
    };
  }

  async getTaskStatus(jobId: string): Promise<TasksCrudDtos.TaskStatus.TaskStatus<unknown>> {
    const job = await this.queue.getJob(jobId);

    assertFoundServer(job, `Task with ID "${jobId}" not found`);

    const state = await job.getState();

    return {
      id: job.id!,
      name: job.name!,
      status: state,
      payload: job.data,
      progress: job.progress,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      failedReason: job.failedReason ?? undefined,
      returnValue: job.returnvalue ?? undefined,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 3,
    };
  }

  private async processJob(job: Job): Promise<any> {
    const handler = taskRegistry.get(job.name);

    if (!handler)
      throw new Error(`Handler for task "${job.name}" not found`);

    this.logger.log(`Processing task: ${job.name} with ID: ${job.id}`);

    return handler.execute(job.data, job);
  }

  async getQueueStatus() {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}
