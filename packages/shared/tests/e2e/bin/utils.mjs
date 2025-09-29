import { chalk, sleep } from "zx";

export async function waitForService(url, timeout = 30000) {
  const start = Date.now();

  console.log(chalk.yellow(`⏳ Waiting for ${url}...`));

  while (Date.now() - start < timeout) {
    try {
      await fetch(url);
      console.log(chalk.green(`✅ Service ready: ${url}`));

      return true;
    } catch {
      await sleep(1000);
    }
  }

  throw new Error(`Service not ready after ${timeout}ms: ${url}`);
}
