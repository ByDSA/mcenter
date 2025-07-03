// @ts-check
import { assertFileExists } from "../fs/index.mjs";
import { $ } from "../../../../../../.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 * @param {string} name
 */
export function assertEnv(name) {
  if (!process.env[name]) {
    console.error(`${name} is required`);
    process.exit(1);
  }
}

function parseEnvs(txt) {
  const envObject = txt
    .split("\n")
    .map((line) => {
      const equalIndex = line.indexOf("=");

      return [line.slice(0, equalIndex), line.slice(equalIndex + 1)];
    } )
    .reduce((acc, [key, value]) => {
      acc[key] = value;

      return acc;
    }, {} );

  return envObject;
}

/**
 *
 * @param {string} txt
 */
function addEnvsTxt(txt) {
  const envObject = parseEnvs(txt);

  // @ts-ignore
  process.env = Object.freeze( {
    ...process.env,
    ...envObject,
  } );
}

/**
 *
 * @param {string} envsFile
 * @typedef {{envs: Record<string, string>}} Opts
 * @param {Opts} [opts]
 */
export async function loadEnvsFile(envsFile, opts) {
  assertFileExists(envsFile);

  const { verbose } = $;

  $.verbose = false;
  let exportEnvsCmd = [];

  if (opts?.envs) {
    let added = 0;

    for (const [key, value] of Object.entries(opts.envs)) {
      if (value !== undefined) {
        exportEnvsCmd.push(`${key}=${value}`);
        added++;
      }
    }

    if (added > 0)
      exportEnvsCmd.unshift("export");
  }

  let out;

  if (exportEnvsCmd.length > 0) {
    out = (
      await $`${exportEnvsCmd} && set -a && source ${envsFile} && env`
    ).stdout.toString();
  } else
    out = (await $`set -a && source ${envsFile} && env`).stdout.toString();

  $.verbose = verbose;
  addEnvsTxt(out);
}
