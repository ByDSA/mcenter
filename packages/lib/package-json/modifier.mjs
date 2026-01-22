// @ts-check
/**
 * Intercambia temporalmente el valor de una clave en un package.json
 * y devuelve una función para revertir el cambio.
 * * @param {Object} params
 * @param {string} params.filePath - Ruta al archivo package.json
 * @param {string} params.keyPath - Ruta de la clave (ej: "dependencies.$shared")
 * @param {string} params.newValue - El valor temporal a aplicar
 * @param {boolean} [params.quiet=false] - Si es true, silencia los logs
 * @returns {Promise<{ restore: Function, originalValue: any }>}
 */
export async function swapPackageJsonKeyValue( {
  filePath,
  keyPath,
  newValue,
  quiet = false,
} ) {
  const absolutePath = path.resolve(filePath);

  if (!(await fs.pathExists(absolutePath)))
    throw new Error(`Archivo no encontrado: ${absolutePath}`);

  const json = await fs.readJson(absolutePath);
  const keys = keyPath.split(".");
  let current = json;

  // Navegación por el objeto JSON
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!(key in current))
      throw new Error(`La ruta intermedia "${key}" no existe en el JSON.`);

    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  const originalValue = current[lastKey];

  if (originalValue === undefined)
    throw new Error(`La clave final "${lastKey}" no existe en el objeto.`);

  // Aplicar el cambio si el valor es distinto
  if (originalValue !== newValue) {
    if (!quiet) {
      echo(
        chalk.blue(
          `📝 Modificando ${keyPath} en ${path.basename(absolutePath)}`,
        ),
      );
      echo(chalk.dim(`   Original: ${originalValue}`));
      echo(chalk.green(`   Temporal: ${newValue}`));
    }

    current[lastKey] = newValue;
    await fs.writeJson(absolutePath, json, { spaces: 2 } );
  }

  /**
   * Función para restaurar el valor original.
   */
  const restore = async () => {
    try {
      const currentJson = await fs.readJson(absolutePath);
      let nav = currentJson;

      for (let i = 0; i < keys.length - 1; i++)
        nav = nav[keys[i]];

      const valueOnDisk = nav[lastKey];

      // Solo restauramos si el valor en disco coincide con el valor temporal que pusimos
      if (valueOnDisk === newValue) {
        if (!quiet) {
          echo(
            chalk.yellow(
              `\n🔄 Restaurando valor original en ${path.basename(absolutePath)}...`,
            ),
          );
          echo(chalk.dim(`   De: ${valueOnDisk}`));
          echo(chalk.dim(`   A:  ${originalValue}`));
        }

        nav[lastKey] = originalValue;
        await fs.writeJson(absolutePath, currentJson, { spaces: 2 } );

        if (!quiet)
          echo(chalk.green("✅ Restauración completada."));
      }
    } catch (error) {
      echo(chalk.bgRed.white(" ERROR CRÍTICO EN RESTAURACIÓN "));
      echo(chalk.red(`No se pudo restaurar ${keyPath}: ${error.message}`));
    }
  };
  // Manejador de interrupción (Ctrl+C)
  const sigintHandler = async () => {
    if (!quiet) {
      echo(
        chalk.red(
          "\n\n🛑 Interrupción detectada (SIGINT). Limpiando cambios temporales...",
        ),
      );
    }

    await restore();
    process.exit(1);
  };

  process.on("SIGINT", sigintHandler);

  return {
    originalValue,
    restore: async () => {
      process.off("SIGINT", sigintHandler); // Importante: limpiar el listener
      await restore();
    },
  };
}
