#!/usr/bin/env dazx
// @ts-check

import { loadEnv } from "dazx/bash";

const from = getFromArgOrFail();
const {ENV} = loadProjectEnv();
const thisFilenameWithoutExt = getFilenameWithoutExtOrFail(import.meta.url);
const folder = path.join(__dirname, `.${thisFilenameWithoutExt}`);
const candidates = fs.readdirSync(folder).filter((f) => f.endsWith(".mjs") || f.endsWith(".sh"));
const file = findScriptFileByParamsOrFail(candidates,
  {
    from,
    env: ENV,
  } );

await $`ENV=${ENV} from=${from} ${path.join(folder, file)}`;

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

function findProjectEnvFileOrFail() {
  let folder = __dirname;

  do {
    fs.readdirSync(folder);

    const gitFolderPath = path.join(folder, ".git");
    const isRootProjectFolder = fs.existsSync(gitFolderPath) && fs.lstatSync(gitFolderPath).isDirectory();
    const envFilePath = path.join(folder, ".envx");

    if (isRootProjectFolder && fs.existsSync(envFilePath) && fs.lstatSync(envFilePath).isFile())
      return envFilePath;

    folder = path.join(folder, "..");
  } while (folder !== "/");

  throw new Error(`No project .env file found from ${__dirname}`);
}

function loadProjectEnv() {
  const projectEnvFile = findProjectEnvFileOrFail();
  const beforeEnvs = process.env;

  loadEnv(projectEnvFile);
  const afterEnvs = process.env;
  /** @type {{[key: string]: string}} */
  const loadedEnvs = Object.entries(afterEnvs).filter(entry => !beforeEnvs[entry[0]])
    .reduce((acc, [key, value]) => {
      acc[key] = value;

      return acc;
    }, {
    } );
  const {ENV} = loadedEnvs;

  if (!ENV)
    throw new Error("No ENV in .env file");

  return {
    ...process.env,
    ENV,
  };
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
    const argsNames = args.map(a => {
      if (a.length === 1)
        return `-${a}`;

      return `--${a}`;
    } );
    const argsList = `${argsNames.slice(0, -1).join(", ") } or ${ argsNames.slice(-1)}`;

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
