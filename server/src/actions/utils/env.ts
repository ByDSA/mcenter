import dotenv from "dotenv";
import fs from "fs";
import config from "../../config";

let alreadyLoaded = false;

// eslint-disable-next-line import/prefer-default-export
export function loadEnv() {
  if (alreadyLoaded)
    return;

  let options;
  let envPath;

  if (isTesting()) {
    envPath = "files/.env.test";

    if (!fs.existsSync(envPath))
      throw new Error(`${envPath} file not found`);

    options = {
      path: envPath,
    };
  } else {
    options = {
      path: "files/.env"
    };
  }

  const result = dotenv.config(options);

  if (result.error)
    throw result.error;

  for (const n of config.requiredEnvVars)
    checkEnvVar(n);

  alreadyLoaded = true;
}

function isTesting() {
  return process.env.JEST_WORKER_ID !== undefined;
}

function checkEnvVar(name: string) {
  if (!process.env[name])
    throw new Error(`Env var ${name} is empty.`);
}
