// @ts-check
import { realpath } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assertEnv, loadEnvsFile } from "../envs/index.mjs";
import { assertFileExists } from "../fs/index.mjs";
import { fetchVersion } from "../package-json/fetch-version.mjs";

export async function loadProjectEnvs() {
  if (!process.env.PROJECT_ROOT) {
    if (!process.env.PROJECT_LIB) {
      // @ts-ignore
      const filename = fileURLToPath(import.meta.url);
      const DIR = await realpath(dirname(filename));

      process.env.PROJECT_ROOT = await realpath(`${DIR}/../../..`);
    } else {
      process.env.PROJECT_ROOT = await realpath(
        `${process.env.PROJECT_LIB}/../..`,
      );
    }
  }

  const projectRoot = process.env.PROJECT_ROOT;

  assertEnv("PROJECT_ROOT");
  assertFileExists(projectRoot);

  if (!process.env.PROJECT_LIB)
    process.env.PROJECT_LIB = `${process.env.PROJECT_ROOT}/packages/lib`;

  const { PROJECT_LIB } = process.env;

  assertFileExists(PROJECT_LIB);

  const projectName = basename(projectRoot);

  process.env.PROJECT_NAME = projectName;

  const packagesRoot = await realpath(`${projectRoot}/packages`);
  const projectVersion = await fetchVersion(`${packagesRoot}/package.json`);

  process.env.PROJECT_VERSION = projectVersion;

  // Exportar variables de entorno
  await loadEnvsFile(`${packagesRoot}/.env`);

  assertEnv("PROJECT_ROOT");
  assertEnv("PROJECT_NAME");
  assertEnv("PROJECT_VERSION");
}
