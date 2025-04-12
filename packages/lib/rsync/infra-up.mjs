// @ts-check

import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 * @typedef {{ssh: import("../ssh/types.mjs").SSH, projectRoot: string, remoteProjectRoot: string}} Params
 * @param {Params} params
 */
export async function infraUp(params) {
  const { ssh } = params;
  const to = ssh.user + "@" + ssh.host + ":" + params.remoteProjectRoot + "/";
  const from = params.projectRoot + "/";

  const cmd = [
    "sudo",
    "rsync",
    "-azvtzyb",
    from,
    to,
    "--filter=: .rsync",
    "--modify-window=3600",
  ];

  if ("keyFile" in ssh) {
    const keyFile = ssh.keyFile;
    cmd.push("-e", `ssh -i "${keyFile}"`);
  }

  console.log("Updating infrastrcuture to remote ...");
  await $`${cmd}`;
}
