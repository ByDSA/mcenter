/* eslint-disable import/prefer-default-export */

let alreadyLoaded = false;

export const ENVS = Object.freeze( {
  redirectServer: process.env.REDIRECT_SERVER as string,
  port: +(process.env.PORT ?? 8080),
} );
assertEnv();

// eslint-disable-next-line import/prefer-default-export
function assertEnv() {
  if (alreadyLoaded)
    return;

  checkEnvVar("REDIRECT_SERVER");

  alreadyLoaded = true;
}

function checkEnvVar(name: string) {
  if (process.env[name] === undefined)
    throw new Error(`Env var ${name} is empty.`);
}
