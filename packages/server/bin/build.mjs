#!/usr/bin/env zx

$.verbose = true;

const PROJECT_ROOT = path.resolve(__dirname, "../");
const TS_CONFIG = path.resolve("tsconfig.json");
const TS_CONFIG_BAK = path.resolve("tsconfig.json.bak");

// Función para restaurar el archivo original
async function restoreConfig() {
  if (await fs.pathExists(TS_CONFIG_BAK)) {
    echo(chalk.yellow("\nRestaurando configuración original..."));
    await fs.move(TS_CONFIG_BAK, TS_CONFIG, { overwrite: true } );
  }
}

process.once("SIGINT", async () => {
  await restoreConfig();
  process.exit(1);
} );
process.once("SIGTERM", async () => {
  await restoreConfig();
  process.exit(1);
} );

async function run() {
  cd(PROJECT_ROOT);

  await $`cp ${TS_CONFIG} ${TS_CONFIG_BAK}`;
  try {
    // Si no se quita el $shared del tsconfig, no resuelve luego los alias en Dockerfile
    // (no sé por qué)
    await $`sed 's|.*../shared/src/.*||' ${TS_CONFIG_BAK} > ${TS_CONFIG}`;

    echo(chalk.blue("tsconfig paths modificados temporalmente."));
    await $`rm -rf build`;

    echo(chalk.blue("Transpiling with tsc ..."));
    await $`tsc -p tsconfig-build.json`;
    await $`tsc-alias -p tsconfig-build.json`;

    echo(chalk.blue("Copying assets ..."));
    await fs.copy(
      "./src/core/mails/templates/styles.css",
      "./build/core/mails/templates/styles.css",
    );

    echo(chalk.bold.green("\n✨ Build finalizado con éxito."));
  } finally {
    await restoreConfig();
  }
}

run();
