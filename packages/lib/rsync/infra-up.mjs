// @ts-check
import { $ } from "zx";

/**
 * @typedef {{ssh: import("../ssh/types.mjs").SSH,
 * projectRoot: string, remoteProjectRoot: string}} Params
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
    const { keyFile } = ssh;

    cmd.push("-e", `ssh -i "${keyFile}"`);
  }

  console.log("Updating infrastrcuture to remote ...");
  const verbose = $.verbose;
  $.verbose = true;

  const process = $`${cmd}`;

  $.verbose = verbose;
  console.log("Updated infrastrcuture!");
}
