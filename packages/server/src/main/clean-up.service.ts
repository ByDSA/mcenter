import { INestApplication } from "@nestjs/common";

export class Cleanup {
  private static apps: INestApplication[] = [];

  private static initialized = false;

  static register(app: INestApplication) {
    this.apps.push(app);
    this.initializeCleanup();
  }

  static {
    if (typeof afterAll === "function") {
      // eslint-disable-next-line no-undef
      afterAll(async () => {
        await Cleanup.cleanup();
      } );
    }
  }

  static cleanup = async () => {
    await Promise.all(this.apps.map(app => app.close()));
    this.apps = [];
  };

  private static initializeCleanup() {
    if (this.initialized)
      return;

    this.initialized = true;

    process.on("exit", this.cleanup);
    process.on("SIGINT", this.cleanup);
    process.on("SIGTERM", this.cleanup);
    process.on("SIGUSR1", this.cleanup);
    process.on("SIGUSR2", this.cleanup);
    process.on("uncaughtException", this.cleanup);
    process.on("unhandledRejection", this.cleanup);
  }
}
