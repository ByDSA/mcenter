import "reflect-metadata";

import { execSync } from "node:child_process";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "#main/app.module";
import { addGlobalConfigToApp } from "#main/init.service";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function main() {
  console.log("Main");
  const app = await NestFactory.create(AppModule);

  addGlobalConfigToApp(app);

  const PORT: number = +(process.env.PORT ?? 8080);

  killProcessesUsingPort(PORT);
  await app.listen(PORT);
} )();

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
