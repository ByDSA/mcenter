// @ts-check

import { assertSshEnvs, assertVaultEnvs } from "../../index.mjs";

/**
 *
 * @param {import("../../projects/deploy/types.mjs").TreeEnvs} ENVS
 */
export function showParams(ENVS) {
  const { ssh, vault, project, docker } = ENVS;
  const TARGET_ENV = ENVS.TARGET_ENV ?? "local";
  const SSH_KEYFILE = "keyFile" in ENVS.ssh ? ENVS.ssh.keyFile : "";
  const REMOTE_PROJECT_ROOT = ENVS.REMOTE_PROJECT_ROOT ?? "";

  console.log("[PROJECT]");
  console.log(`Project: ${project.name}`);
  console.log(`Project Version: ${project.version}`);
  console.log(`Project Root: ${project.root}`);
  console.log(`Target env: ${TARGET_ENV}`);
  console.log("Docker replace image: " + docker.replaceImage);
  console.log("");

  if (TARGET_ENV !== "local") {
    console.log("[Remote]");
    console.log(`Docker Registry Url: ${docker.registryUrl}`);
    console.log(`Remote Project Root: ${REMOTE_PROJECT_ROOT}`);
    console.log("");
    console.log("[SSH]");
    console.log(`User: ${ssh.user}`);
    console.log(`Host: ${ssh.host}`);
    console.log(`Keyfile: ${SSH_KEYFILE}`);
    assertSshEnvs();
    console.log("");

    console.log("[VAULT]");
    console.log(`VAULT_ADDR: ${vault.addr}`);
    console.log(`Username: ${vault.username}`);
    console.log(`Password: ${hidePassword(vault.password)}`);
    console.log(`Unseal Key 1: ${hidePassword(vault.unsealKeys[0])}`);
    assertVaultEnvs();
    console.log("");
  }
}

function hidePassword(password) {
  return "*".repeat(password.length);
}
