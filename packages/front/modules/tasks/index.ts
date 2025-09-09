import { TasksCrudDtos } from "$shared/models/tasks";
import { logger } from "#modules/core/logger";

type Props<S> = {
  taskName: string;
  url: string;
  onListenStatus: (status: S)=> Promise<S>;
};
export async function streamTaskStatus<
  S extends TasksCrudDtos.TaskStatus.TaskStatus<any>
>( { taskName, url, onListenStatus }: Props<S>) {
  return await new Promise((resolve, reject) => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      logger.info(`Starting task "${taskName}".`);
    };

    eventSource.addEventListener("task-status", async (
      event: MessageEvent<S>,
    ) => {
      const receivedTaskStatus: S = typeof event.data === "string"
        ? JSON.parse(event.data)
        : event.data;
      const taskStatus = await onListenStatus?.(receivedTaskStatus);

      switch (taskStatus.status) {
        case "failed": {
          if (!taskStatus.finishedAt) {
            logger.warn(taskStatus.failedReason);

            return;
          } else
            logger.error(`Task "${taskName}" failed: ${taskStatus.failedReason}`);
        }
          break;
        case "completed":
          logger.info(`Task "${taskName}" completed!`);
          break;
        default:
          break;
      }

      if (
        taskStatus.status === "completed"
          || (taskStatus.status === "failed" && taskStatus.finishedAt)
      ) {
        eventSource.close();

        if (taskStatus.status === "completed")
          resolve(taskStatus.returnValue);
        else
          reject(new Error(taskStatus.failedReason ?? "Task failed"));
      }
    } );

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
    };
  } );
}
