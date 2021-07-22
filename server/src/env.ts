import dotenv from "dotenv";
import fs from "fs";
import path from "path";

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

  checkEnvVar("MEDIA_PATH");
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

export function getFullPathSeries(relativePath: string): string {
  loadEnv();
  const MEDIA_PATH = <string>process.env.MEDIA_PATH;

  return path.join(MEDIA_PATH, relativePath);
}

export function getFullPathMusic(relativePath: string): string {
  loadEnv();
  const MUSIC_PATH = <string>process.env.MUSIC_PATH;

  return path.join(MUSIC_PATH, relativePath);
}
