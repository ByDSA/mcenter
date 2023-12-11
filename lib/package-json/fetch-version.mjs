// @ts-check

import { assertFileExists } from "../fs/index.mjs";
import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 *
 * @param {string} file
 * @returns {Promise<string>}
 */
export async function fetchVersion(file = "./package.json") {
  assertFileExists(file);

  // Extrae la versión usando jq si está instalado, de lo contrario usa grep
  let version;
  try {
    version = (await $`jq -r '.version' ${file}`).stdout.trim();
  } catch (error) {
    // Si jq no está instalado, usa grep
    version = (
      await $`grep -o '"version": *"[^"]*"' ${file} | awk -F'": *"' '{print $2}' | tr -d '"'`
    ).stdout.trim();
  }

  return version;
}
