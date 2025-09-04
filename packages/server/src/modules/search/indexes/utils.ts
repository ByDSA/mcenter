import { MeiliSearch, Task } from "meilisearch";

export async function waitForTask(
  client: MeiliSearch,
  taskUid: number,
  intervalMs = 200,
  timeoutMs = 30000,
): Promise<Task> {
  const start = Date.now();

  while (true) {
    const task = (await client.httpRequest.get( {
      path: `/tasks/${taskUid}`,
    } )) as Task;

    if (task.status === "succeeded" || task.status === "failed" || task.status === "canceled")
      return task;

    if (Date.now() - start > timeoutMs)
      throw new Error(`Timeout esperando a que termine la tarea ${taskUid}`);

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
