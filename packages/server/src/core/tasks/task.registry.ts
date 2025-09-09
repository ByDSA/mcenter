import { AnyTaskHandler } from "./task.interface";

class TaskRegistry {
  private handlers = new Map<string, AnyTaskHandler>();

  register(handler: AnyTaskHandler): void {
    if (this.handlers.has(handler.taskName))
      throw new Error(`Task handler "${handler.taskName}" is already registered`);

    this.handlers.set(handler.taskName, handler);
  }

  get(name: string): AnyTaskHandler | undefined {
    return this.handlers.get(name);
  }

  getAll(): AnyTaskHandler[] {
    return Array.from(this.handlers.values());
  }

  has(name: string): boolean {
    return this.handlers.has(name);
  }
}

export const taskRegistry = new TaskRegistry();
