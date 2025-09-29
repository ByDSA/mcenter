/* eslint-disable no-underscore-dangle */
import { $, chalk } from "zx";
import { waitForService } from "./utils.mjs";

const DEFAULT_FRONTEND_PORT = 3000;
const FRONTEND_DIR = "../../../../front";

async function findFrontendPort() {
  console.log(
    chalk.blue(`🔍 Looking for Next.js server from port ${DEFAULT_FRONTEND_PORT + 5} to \
${DEFAULT_FRONTEND_PORT}...`),
  );

  for (let port = DEFAULT_FRONTEND_PORT + 5; port >= DEFAULT_FRONTEND_PORT; port--) {
    const isNext = await isNextServer(port);

    if (isNext) {
      console.log(chalk.green(`✅ Found Next.js server on port ${port}`));

      return port;
    } else {
      const processInfo = await getProcessOnPort(port);

      if (processInfo) {
        console.log(
          chalk.yellow(`⚠️  Port ${port} is occupied by: \
${processInfo.command} (PID: ${processInfo.pid})`),
        );
      }
    }
  }

  console.log(chalk.yellow("⚠️  No Next.js server found. Frontend needs to be started."));

  return null;
}

async function isNextServer(port) {
  const processInfo = await getProcessOnPort(port);

  if (!processInfo)
    return false;

  if (processInfo.command.includes("next-server"))
    return true;

  return false;
}

export async function startFrontend() {
  const runningPort = await findFrontendPort();

  if (runningPort !== null) {
    const _frontendUrl = `http://localhost:${runningPort}`;

    await $`echo "FRONTEND_URL=${_frontendUrl}" >>.tmp`;

    console.log(chalk.green("✅ Frontend already running on port " + runningPort));

    return null;
  }

  console.log(chalk.blue("🔧 Starting frontend..."));
  const processPromise = $`cd ${FRONTEND_DIR} && pnpm run dev`;
  const actualProcess = processPromise.child;
  const _frontendUrl = `http://localhost:${DEFAULT_FRONTEND_PORT}`;

  await waitForService(_frontendUrl);

  await $`echo "FRONTEND_URL=${_frontendUrl}" >>.tmp`;

  return actualProcess;
}

export async function getProcessOnPort(port) {
  try {
    // Ejecutar el comando ss para buscar procesos en el puerto especificado
    const result = await $`ss -ltnp | grep :${port}`;

    if (!result.stdout || result.stdout.trim() === "")
      return null;

    // Parsear la salida para extraer el PID y comando
    const lines = result.stdout.trim().split("\n");

    for (const line of lines) {
      // formato "users:(("comando",pid=123,fd=4))"
      const match = line.match(/users:\(\("([^"]+)",pid=(\d+),/);

      if (match) {
        const [, command, pid] = match;

        return {
          command: command,
          pid: parseInt(pid, 10),
        };
      }
    }

    return null;
  } catch {
    // Si el comando falla (por ejemplo, no hay procesos en ese puerto)
    return null;
  }
}
