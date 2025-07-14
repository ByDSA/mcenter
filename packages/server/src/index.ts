import "reflect-metadata";

import { execSync } from "node:child_process";
import { NestFactory } from "@nestjs/core";
import { NextFunction } from "express";
import { AppModule } from "#main/app.module";
import { addGlobalConfigToApp } from "#main/init.service";

(async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  addGlobalConfigToApp(app);

  const PORT: number = +(process.env.PORT ?? 8080);

  killProcessesUsingPort(PORT);

  const requestLogger = (
    request: Request,
    _: Response,
    next: NextFunction,
  ) => {
    console.log(`[${request.method}] ${request.url}`);
    next();
  };

  app.use(requestLogger);

  await app.listen(PORT);
} )().catch((error) => {
  console.error("Error starting application:", error);
  process.exit(1);
} );

function killProcessesUsingPort(port: number): void {
  // Get all PIDs using the port in a single command
  const currentPid = process.pid.toString();
  const pids = execSync(`lsof -ti tcp:${port} || true`).toString()
    .split("\n")
    .filter(Boolean)
    .filter(pid=>pid !== currentPid);

  if (pids.length === 0)
    return;

  console.log("Current pid:", currentPid);
  console.log("Killing processes using port", port + ":", pids);

  // Kill all found PIDs
  execSync(`kill -9 ${pids.join(" ")}`);
}
