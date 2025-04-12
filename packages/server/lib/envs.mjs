// @ts-check
import { remoteUpdateEnvs } from "../../lib/packages/deploy/index.mjs";

/**
 * @param {{
 * remoteProjectRoot: string,
 * targetEnv: string,
 * ssh: import("../../lib/ssh/types.mjs").SSH,
 * vault: import("../../lib/secrets/types.mjs").Vault,
 * }} params
 */
export async function updateRemoteEnvs(params) {
  const { remoteProjectRoot, targetEnv, vault, ssh } = params;
  const packageName = "server";
  const projectName = "mcenter";

  await remoteUpdateEnvs( {
    outEnvFile: `"${remoteProjectRoot}"/packages/${packageName}/.env`,
    packageName,
    projectName,
    ssh,
    targetEnv,
    vault,
  } );
}
