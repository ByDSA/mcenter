import { UnrecoverableError } from "bullmq";

export type TaskSignal = "kill" | "pause";

/**
 * Error lanzado cuando se detecta señal "kill".
 * Extiende UnrecoverableError para que BullMQ NO reintente el job —
 * sin esto, un job con attempts=3 se reintentaría 3 veces antes de fallar.
 */
export class TaskCancelledError extends UnrecoverableError {
  constructor(jobId: string) {
    super(`Job ${jobId} cancelled by user`);
    this.name = "TaskCancelledError";
  }
}

/**
 * Error lanzado por stopJobChecker cuando detecta señal "pause".
 * processJob lo intercepta, mueve el job a `delayed` (mismo ID) y lanza
 * DelayedError para que BullMQ no lo marque como failed/completed.
 */
export class TaskPausedError extends Error {
  constructor(jobId: string) {
    super(`Job ${jobId} paused by user`);
    this.name = "TaskPausedError";
  }
}
