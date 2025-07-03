// @ts-check
import { $ } from "../../../../../../.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 * @typedef {{cmd: string, ssh: import("./types.mjs").SSH}} Params
 * @param {Params} params
 */
export async function cmd(params) {
  const { cmd, ssh } = params;

  if (!cmd)
    throw new Error("cmd is required");

  const { host, user } = ssh;
  const cmdExec = [];

  cmdExec.push("ssh", `${user}@${host}`, cmd);

  if ("keyFile" in ssh) {
    const { keyFile } = ssh;

    cmdExec.splice(1, 0, "-i", keyFile);
  } else if ("password" in ssh) {
    // Warning: plain password is not secure
    const { password } = ssh;

    cmdExec.unshift("sshpass", "-p", password);
  }

  await $`${cmdExec}`;
}
