import { SetMetadata } from "@nestjs/common";

export const TASK_HANDLER_METADATA = Symbol("TaskHandler");

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TaskHandlerClass = () => SetMetadata(TASK_HANDLER_METADATA, true);
