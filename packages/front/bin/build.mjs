#!/usr/bin/env zx
import { swapPackageJsonKeyValue } from "../../lib/package-json/modifier.mjs";

$.verbose = true;

const PACKAGE_PATH = path.resolve(__dirname, "../package.json");
const PROJECT_ROOT = path.resolve(__dirname, "../");
const TARGET_KEY = "dependencies.$shared";
const TEMP_VALUE = "workspace:../shared/build";

async function run() {
  let pkgSwap;

  try {
    // 1. Intercambio temporal de valores
    pkgSwap = await swapPackageJsonKeyValue( {
      filePath: PACKAGE_PATH,
      keyPath: TARGET_KEY,
      newValue: TEMP_VALUE,
    } );

    // 2. Ejecución del proceso de build
    echo(chalk.cyan("\n🚀 Ejecutando Next Build...\n"));
    cd(PROJECT_ROOT);
    await $`npx next build --webpack`;

    echo(chalk.bold.green("\n✨ Build finalizado con éxito."));
  } catch (err) {
    if (err.exitCode !== undefined)
      echo(chalk.red(`\n💥 Error en el proceso de build (Exit Code: ${err.exitCode})`));

    process.exitCode = 1;
  } finally {
    await pkgSwap?.restore();
  }
}

run();
