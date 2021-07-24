import dotenv from "dotenv";
import fs from "fs";

let alreadyLoaded = false;

// eslint-disable-next-line import/prefer-default-export
export function loadEnv() {
  if (alreadyLoaded)
    return;

  let options;
  let envPath;

  if (isTesting()) {
    envPath = ".env.test";

    if (!fs.existsSync(envPath))
      throw new Error(`${envPath} file not found`);

    options = {
      path: envPath,
    };
  } else {
    options = {
    };
  }

  const result = dotenv.config(options);

  if (result.error)
    throw result.error;

  checkEnvVar("MUSICS_PATH");
  checkEnvVar("VIDEOS_PATH");
  checkEnvVar("SERIES_PATH");
  checkEnvVar("MOVIES_PATH");
  checkEnvVar("MONGO_DB");
  // checkEnvVar("MONGO_PORT");
  checkEnvVar("MONGO_USER");
  checkEnvVar("MONGO_PASSWORD");

  alreadyLoaded = true;
}

function isTesting() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export function checkEnvVar(name: string) {
  if (!process.env[name])
    throw new Error(`Env var ${name} is empty.`);
}
