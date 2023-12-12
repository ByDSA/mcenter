#!/usr/bin/env zx
// @ts-check

import { loadProjectEnvs } from "../../../../lib/projects/envs.mjs";

(async () => {
  const from = getFromArgOrFail();
  const outFile = getOutFileArg();

  await loadProjectEnvs();
  const { ENV } = process.env;
  const thisFilenameWithoutExt = getFilenameWithoutExtOrFail(import.meta.url);
  const folder = path.join(__dirname, `.${thisFilenameWithoutExt}`);
  const candidates = fs
    .readdirSync(folder)
    .filter((f) => f.endsWith(".mjs") || f.endsWith(".sh"));
  const file = findScriptFileByParamsOrFail(candidates, {
    from,
    env: ENV,
  } );

  await $`ENV=${ENV} from=${from} outFile=${outFile} ${path.join(
    folder,
    file,
  )}`;
} )().catch(console.error);

/**
 * @param {string[]} scriptFiles
 * @param {{[key: string]: string}} params
 */
function findScriptFileByParamsOrFail(scriptFiles, params) {
  const paramsKeys = Object.keys(params);
  const files = [];

  // eslint-disable-next-line no-restricted-syntax, no-labels
  fileFor: for (const scriptFile of scriptFiles) {
    const scriptFileParams = getParamsFromScriptFile(scriptFile);
    const scriptFileParamsKeys = Object.keys(scriptFileParams);

    for (const key of scriptFileParamsKeys) {
      if (!paramsKeys.includes(key))
        // eslint-disable-next-line no-labels, no-continue
        continue fileFor;

      if (!scriptFileParams[key].match(`^${params[key]}`))
        // eslint-disable-next-line no-labels, no-continue
        continue fileFor;
    }

    files.push(scriptFile);
  }

  if (files.length === 1)
    return files[0];

  if (files.length > 1)
    throw new Error(`Multiple files found: ${files.join(", ")}`);

  throw new Error(`No file found for params: ${JSON.stringify(params)}`);
}

/**
 * @param {string} scriptFile
 * @returns {{[key: string]: string}}
 */
function getParamsFromScriptFile(scriptFile) {
  const lastDotIndex = scriptFile.lastIndexOf(".");
  const paramsAll = scriptFile.slice(0, lastDotIndex);
  const params = paramsAll.split(";").reduce((acc, param) => {
    const [key, value] = param.split("=");

    acc[key] = value;

    return acc;
  }, {
  } );

  return params;
}

function getFromArgOrFail() {
  return getArgOrFail(["from", "f"]);
}

/**
 * @param {string[]} args
 */
function getArgOrFail(args) {
  let f;

  for (const arg of args) {
    f = argv[arg];

    if (f)
      break;
  }

  if (!f) {
    const argsNames = args.map((a) => {
      if (a.length === 1)
        return `-${a}`;

      return `--${a}`;
    } );
    const argsList = `${argsNames.slice(0, -1).join(", ")} or ${argsNames.slice(
      -1,
    )}`;

    throw new Error(`Missing ${argsList}`);
  }

  return f;
}

/**
 * @param {string} filename
 */
function getFilenameWithoutExtOrFail(filename) {
  const lastSlashIndex = filename.lastIndexOf("/");

  if (lastSlashIndex === -1)
    throw new Error(`No slash in filename: ${filename}`);

  const lastDotIndex = filename.slice(lastSlashIndex).indexOf(".");

  if (lastDotIndex === -1)
    throw new Error(`No dot after slash in filename: ${filename}`);

  const ret = filename.slice(lastSlashIndex + 1, lastSlashIndex + lastDotIndex);

  if (!ret)
    throw new Error("Empty filename");

  return ret;
}

function genTimestamp() {
  const now = new Date();
  const timestamp = [
    [
      now.getFullYear(),
      (now.getMonth() + 1).toString().padStart(2, "0"),
      now.getDate().toString()
        .padStart(2, "0"),
    ].join("-"),
    [
      now.getHours().toString()
        .padStart(2, "0"),
      now.getMinutes().toString()
        .padStart(2, "0"),
      now.getSeconds().toString()
        .padStart(2, "0"),
    ].join("-"),
  ].join("-");

  return timestamp;
}

function getOutFileArg() {
  const timestamp = genTimestamp();
  const outFile = argv._[0] ?? `${__dirname}/dump-${timestamp}.db`;

  return outFile;
}
