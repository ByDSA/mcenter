import "reflect-metadata";

import { execSync } from "node:child_process";
import { NestFactory } from "@nestjs/core";
import { Logger, LoggerService } from "@nestjs/common";
import { AppModule } from "#main/app.module";
import { addGlobalConfigToApp } from "#main/init.service";

(async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  addGlobalConfigToApp(app);
  const logger = app.get(Logger);
  const PORT: number = +(process.env.PORT ?? 8080);

  if (process.env.NODE_ENV === "development")
    killProcessesUsingPort(PORT, logger);

  await app.listen(PORT);
} )().catch((error) => {
  console.error("Error starting application:", error);
  process.exit(1);
} );

function killProcessesUsingPort(port: number, logger: LoggerService): void {
  // Get all PIDs using the port in a single command
  const currentPid = process.pid.toString();
  const pids = execSync(`lsof -ti tcp:${port} || true`).toString()
    .split("\n")
    .filter(Boolean)
    .filter(pid=>pid !== currentPid);

  if (pids.length === 0)
    return;

  logger.log("Current pid:", currentPid);
  logger.log("Killing processes using port", port + ":", pids);

  // Kill all found PIDs
  execSync(`kill -9 ${pids.join(" ")}`);
}
