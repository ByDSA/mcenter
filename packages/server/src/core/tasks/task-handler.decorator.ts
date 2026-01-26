import { SetMetadata } from "@nestjs/common";

export const TASK_HANDLER_METADATA = Symbol("TaskHandler");

export const TaskHandlerClass = () => SetMetadata(TASK_HANDLER_METADATA, true);
