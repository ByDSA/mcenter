// @ts-check
import { sshCmd } from "../../index.mjs";
import { getSecretsEnvFormat } from "../../secrets/index.mjs";

/**
 * @typedef {{
 * projectName: string,
 * packageName: string,
 * ssh: import("../../ssh/types.mjs").SSH,
 * outEnvFile: string,
 * targetEnv: string,
 * vault: import("../../secrets/types.mjs").Vault,
 * }} Params
 * @param {Params} params
 */
export async function remoteUpdateEnvs(params) {
  const { projectName, packageName, ssh, outEnvFile, targetEnv, vault } = params;

  console.log("Remote: updating envs ...");

  const SECRETS = await getSecretsEnvFormat( {
    projectName,
    packageName,
    targetEnv,
    vault,
  } );
  const SECRETS_ESCAPED = escapeEnvChars(SECRETS);

  sshCmd( {
    cmd: `echo "${SECRETS_ESCAPED}" > "${outEnvFile}"`,
    ssh,
  } );
}

function escapeEnvChars(str) {
  return str.replace(/"/g, "\\\"").replace(/\$/g, "\\$")
    .replace(/`/g, "\\`");
}

export { showParams } from "./show-params.mjs";
