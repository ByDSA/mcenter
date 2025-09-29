import { $, chalk } from "zx";
import { waitForService } from "./utils.mjs";

const BACKEND_PORT = 8011;
// eslint-disable-next-line no-underscore-dangle
let _backendUrl = `http://localhost:${BACKEND_PORT}`;

export const backendUrl = (url = "")=> `${_backendUrl}${url}`;
// Configuración
const BACKEND_HEALTH_ENDPOINT = backendUrl();
const BACKEND_DIR = "../../../../server";

async function checkProcessRunning(port) {
  try {
    await $`lsof -ti:${port}`;

    return true;
  } catch {
    return false;
  }
}

export async function startBackend() {
  const isRunning = await checkProcessRunning(BACKEND_PORT);

  await $`echo "BACKEND_URL=${_backendUrl}" >>.tmp`;

  if (isRunning) {
    console.log(chalk.green("✅ Backend already running on port " + BACKEND_PORT));

    return null;
  }

  console.log(chalk.blue("🔧 Starting backend..."));
  const processPromise = $`cd ${BACKEND_DIR} && pnpm run start:watch`.nothrow();
  const actualProcess = processPromise.child;

  await waitForService(BACKEND_HEALTH_ENDPOINT);

  return actualProcess;
}
