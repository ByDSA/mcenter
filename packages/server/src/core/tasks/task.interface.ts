import { TasksCrudDtos } from "$shared/models/tasks";
import { Job } from "bullmq";

type TaskJob<T> = TasksCrudDtos.CreateTask.TaskJob<T>;
type TaskOptions = TasksCrudDtos.CreateTask.TaskOptions;

export interface TaskHandler<TPayload, TResult> {
  readonly taskName: string;
  execute(payload: TPayload, job: Job<TPayload, TResult>): Promise<TResult>;
  addTask(payload: TPayload, options?: Partial<TaskOptions>): Promise<TaskJob<TPayload>>;
}

export type AnyTaskHandler = TaskHandler<any, any>;
