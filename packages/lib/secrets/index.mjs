// @ts-check

import { assertEnv } from "../envs/index.mjs";
import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 *
 * @typedef {{
 * vault: import("./types.mjs").Vault,
 * projectName: string,
 * packageName: string,
 * targetEnv: string,
 * }} Params
 * @param {Params} params
 */
export async function getSecretsEnvFormat(params) {
  const { vault, projectName, packageName, targetEnv } = params;

  const cmd = [];
  cmd.push(`VAULT_ADDR=${vault.addr}`);
  cmd.push("vault", "operator", "unseal", vault.unsealKeys[0]);
  await $`${cmd}`;

  await $`VAULT_ADDR=${vault.addr} vault login -method=userpass \
    username="${vault.username}" \
    password="${vault.password}" >/dev/null`;

  const path = projectName + "/" + packageName + "/env." + targetEnv;

  const out = (
    await $`VAULT_ADDR=${vault.addr} vault kv get -format=json kv1/danisales/${path} | jq -r '.data' | jq -r 'to_entries | map("\\(.key)=\\"\\(.value|tostring)\\"") | .[]'`
  ).stdout
    .toString()
    .trim();

  return out;
}

export function assertVaultEnvs() {
  assertEnv("VAULT_ADDR");
  assertEnv("VAULT_USERNAME");
  assertEnv("VAULT_PASSWORD");
  assertEnv("VAULT_UNSEAL_KEY_1");
}
