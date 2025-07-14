// @ts-check
import { $ } from "zx";
import { assertFileExists } from "../fs/index.mjs";

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
  } catch {
    // Si jq no está instalado, usa grep
    version = (
      await $`grep -o '"version": *"[^"]*"' ${file} | awk -F'": *"' '{print $2}' | tr -d '"'`
    ).stdout.trim();
  }

  return version;
}
