#!/usr/bin/env zx

import { $, chalk } from "zx";
import { startBackend } from "./back.mjs";
import { startFrontend } from "./front.mjs";

const E2E_DIR = "..";

console.log(chalk.blue("🚀 Starting E2E Test Runner"));

async function verifyDependencies() {
  try {
    // Verificar si playwright está instalado
    await $`npx playwright --version`.quiet();
  } catch {
    console.log(chalk.yellow("📦 Installing Playwright..."));
    await $`npx playwright install`;
  }
}

async function runPlaywrightTests() {
  console.log(chalk.blue("🎭 Running Playwright E2E tests..."));

  // Ejecutar tests
  $.verbose = true;
  process.env.FORCE_COLOR = "1";
  process.env.TERM = "xterm-256color";
  const result = await $`cd ${E2E_DIR} &&
    npx playwright test --reporter=list`.stdio([process.stdin, process.stdout, process.stderr]);

  $.verbose = false;

  return result.exitCode === 0;
}

// eslint-disable-next-line require-await
async function cleanup(processes) {
  console.log(chalk.blue("🧹 Cleaning up..."));

  for (const process of processes) {
    if (process && process.pid) {
      try {
        process.kill("SIGTERM");
        console.log(chalk.green(`✅ Process ${process.pid} terminated`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Could not kill process: ${error.message}`));
      }
    }
  }
}

async function main() {
  const startedProcesses = [];

  try {
    await verifyDependencies();

    await $`rm -rf .tmp && touch .tmp`;

    // 1. Levantar servicios
    const backendProcess = await startBackend();

    if (backendProcess)
      startedProcesses.push(backendProcess);

    const frontendProcess = await startFrontend();

    if (frontendProcess)
      startedProcesses.push(frontendProcess);

    const success = await runPlaywrightTests();

    if (success) {
      console.log(chalk.green("🎉 All E2E tests passed!"));
      process.exit(0);
    } else {
      console.log(chalk.red("❌ Some E2E tests failed"));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("💥 Error during E2E test execution:"), error.message);
    process.exit(1);
  } finally {
    // Solo hacer cleanup de procesos que nosotros iniciamos
    if (startedProcesses.length > 0)
      await cleanup(startedProcesses);
  }
}

// Manejar Ctrl+C
process.on("SIGINT", () => {
  console.log(chalk.yellow("\n⚠️  Received SIGINT, cleaning up..."));
  process.exit(1);
} );

main();
