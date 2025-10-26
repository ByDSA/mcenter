#!/usr/bin/env zx

// Elimina archivos .log vacíos de la carpeta ../logs/
const logsDir = path.join(__dirname, "../logs");

async function cleanEmptyLogs() {
  console.log(chalk.blue(`🔍 Buscando archivos .log vacíos en: ${logsDir}`));

  // Verificar que la carpeta existe
  if (!fs.existsSync(logsDir)) {
    console.log(chalk.red(`❌ La carpeta ${logsDir} no existe`));
    process.exit(1);
  }

  // Buscar todos los archivos .log
  const logFiles = await glob(`${logsDir}/**/*.log`);

  if (logFiles.length === 0) {
    console.log(chalk.yellow("⚠️  No se encontraron archivos .log"));

    return;
  }

  console.log(chalk.cyan(`📁 Encontrados ${logFiles.length} archivos .log`));

  let deletedCount = 0;
  let emptyFiles = [];

  // Revisar cada archivo
  for (const file of logFiles) {
    const stats = fs.statSync(file);

    if (stats.size === 0)
      emptyFiles.push(file);
  }

  if (emptyFiles.length === 0) {
    console.log(chalk.green("✅ No hay archivos .log vacíos para eliminar"));

    return;
  }

  console.log(chalk.yellow(`\n📋 Se encontraron ${emptyFiles.length} archivos vacíos:`));
  emptyFiles.forEach(file => {
    console.log(chalk.gray(`   - ${path.relative(logsDir, file)}`));
  } );

  for (const file of emptyFiles) {
    try {
      fs.unlinkSync(file);
      deletedCount++;
      console.log(chalk.green(`✓ Eliminado: ${path.relative(logsDir, file)}`));
    } catch (error) {
      console.log(chalk.red(`✗ Error al eliminar ${file}: ${error.message}`));
    }
  }

  console.log(chalk.bold.green(`\n🎉 Se eliminaron ${deletedCount} archivos vacíos`));
}

// Detectar y arreglar archivos .log que no pertenecen al usuario actual
async function fixLogs() {
  const currentUser = (await $`whoami`).stdout.trim();

  console.log(chalk.blue(`🔍 Buscando archivos .log que no pertenecen a ${currentUser}...`));

  // Buscar archivos .log que no pertenecen al usuario actual
  const { stdout } = await $`find ${logsDir} -type f -name "*.log" ! -user ${currentUser}`;
  const problematicFiles = stdout.trim().split("\n")
    .filter(f => f);

  if (problematicFiles.length === 0) {
    console.log(chalk.green("✅ No se encontraron archivos .log con problemas de permisos"));

    return;
  }

  console.log(chalk.yellow(`\n📋 Encontrados ${problematicFiles.length} archivos problemáticos.`));

  console.log(chalk.blue("\n🔧 Cambiando propietario a " + currentUser + "..."));

  // Cambiar propietario de todos los archivos problemáticos
  await $`sudo chown ${currentUser}:${currentUser} ${problematicFiles}`;

  console.log(chalk.green("✅ Permisos corregidos!"));

  // Verificar
  console.log(chalk.blue("\n📊 Verificando..."));
  await $`ls -la ${problematicFiles.slice(0, 5)}`.quiet();
}

await cleanEmptyLogs();

await fixLogs();
