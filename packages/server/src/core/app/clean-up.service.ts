import { getQueueToken } from "@nestjs/bullmq";
import { INestApplication } from "@nestjs/common";
import { Queue } from "bullmq";
import { QUEUE_NAME } from "#core/tasks/task.service";

type Listener = (...args: any[])=> void;
export class Cleanup {
  private static apps: INestApplication[] = [];

  private static initialized = false;

  private static listeners = new Map<string, Listener>();

  static register(app: INestApplication) {
    this.apps.push(app);
    this.initializeCleanup();
  }

  static {
    if (typeof afterAll === "function") {
      // eslint-disable-next-line no-undef
      afterAll(async () => {
        await Cleanup.cleanup();
        Cleanup.removeListeners();
      } );
    }
  }

  static cleanup = async () => {
    for (const app of this.apps) {
    // Intenta cerrar BullMQ
      try {
        const queue = app.get<Queue>(getQueueToken(QUEUE_NAME), {
          strict: false,
        } );

        if (queue) {
          await queue.close();
          await queue.disconnect();
        }
      } catch {
      // BullMQ no existe en esta app/test
      }
    }

    await Promise.all(this.apps.map(app => app.close()));
    this.apps = [];
  };

  private static initializeCleanup() {
    if (this.initialized)
      return;

    this.initialized = true;

    const events = [
      "exit",
      "SIGINT",
      "SIGTERM",
      "SIGUSR1",
      "SIGUSR2",
      "uncaughtException",
      "unhandledRejection",
    ] as const;

    events.forEach(event => {
      const handler = this.cleanup;

      this.listeners.set(event, handler);
      process.on(event, handler);
    } );
  }

  private static removeListeners() {
    this.listeners.forEach((handler, event) => {
      process.off(event as any, handler);
    } );
    this.listeners.clear();
    this.initialized = false;
  }
}
