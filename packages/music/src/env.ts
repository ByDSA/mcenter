import path from "path";

let alreadyLoaded = false;

export const ENVS = Object.freeze( {
  mediaPath: process.env.MEDIA_PATH as string,
  mongo: {
    db: process.env.MONGO_DB as string,
    user: process.env.MONGO_USER as string | undefined,
    password: process.env.MONGO_PASSWORD as string | undefined,
    port: process.env.MONGO_PORT ? +process.env.MONGO_PORT : undefined,
    hostname: process.env.MONGO_HOSTNAME as string,
  },
  server: process.env.SERVER as string,
  port: +(process.env.PORT ?? 8080),
} );
assertEnv();

// eslint-disable-next-line import/prefer-default-export
function assertEnv() {
  if (alreadyLoaded)
    return;

  checkEnvVar("MEDIA_PATH");
  checkEnvVar("MONGO_DB");
  checkEnvVar("MONGO_USER");
  checkEnvVar("MONGO_PASSWORD");
  checkEnvVar("SERVER");

  alreadyLoaded = true;
}

function checkEnvVar(name: string) {
  if (process.env[name] === undefined)
    throw new Error(`Env var ${name} is empty.`);
}

export function getFullPath(relativePath: string): string {
  const {mediaPath} = ENVS;

  return path.join(mediaPath, relativePath);
}
