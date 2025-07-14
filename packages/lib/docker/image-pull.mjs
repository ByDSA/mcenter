// @ts-check
import { $ } from "zx";
import { sshCmd } from "../ssh/index.mjs";

/**
 * @typedef {Object} Params
 * @property {string} imageName
 * @property {string} [tag]
 * @param {Params} params
 */
export async function imagePull(params) {
  const tag = params.tag ?? "latest";
  const cmd = imagePullCmd( { ...params, tag } );

  console.log(`Pulling ${params.imageName}:${tag} ...`);
  await $`${cmd}`;
}

/**
 * @typedef {Params & {ssh: import("../ssh/types.mjs").SSH}} ParamsRemote
 * @param {ParamsRemote} params
 */
export async function remoteImagePull(params) {
  const { tag: tagArg, ssh, imageName } = params;
  const tag = tagArg ?? "latest";
  const cmd = imagePullCmd( { ...params, tag } );

  console.log(`Remote: pulling ${imageName}:${tag} ...`);
  await sshCmd( {
    cmd: cmd.join(" "),
    ssh,
  } );
}

/**
 *
 * @param {Params} params
 */
function imagePullCmd(params) {
  const { imageName, tag } = params;
  const imageFull = `${imageName}:${tag}`;
  const localCmd = ["sudo", "docker", "pull", imageFull];

  return localCmd;
}
