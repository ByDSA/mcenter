import path from "path";

let alreadyLoaded = false;

// eslint-disable-next-line import/prefer-default-export
export function loadEnv() {
  if (alreadyLoaded)
    return;

  checkEnvVar("MEDIA_PATH");
  checkEnvVar("MONGO_DB");
  checkEnvVar("MONGO_USER");
  checkEnvVar("MONGO_PASSWORD");
  checkEnvVar("SERVER");

  alreadyLoaded = true;
}

export function checkEnvVar(name: string) {
  if (process.env[name] === undefined)
    throw new Error(`Env var ${name} is empty.`);
}

export function getFullPath(relativePath: string): string {
  loadEnv();
  const MEDIA_PATH = <string>process.env.MEDIA_PATH;

  return path.join(MEDIA_PATH, relativePath);
}
