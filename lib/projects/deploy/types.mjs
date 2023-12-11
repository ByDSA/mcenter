/**
 * @typedef {{
 * PROJECT_LIB: string;
 * PROJECT_ROOT: string;
 * PROJECT_NAME: string;
 * PROJECT_VERSION: string;
 * DOCKER_REGISTRY_URL: string;
 * DOCKER_PLATFORM?: string;
 * REMOTE_PROJECT_ROOT: string;
 * TARGET_ENV: string;
 * SSH_USER: string;
 * SSH_HOST: string;
 * SSH_KEYFILE: string;
 * VAULT_ADDR: string;
 * VAULT_USERNAME: string;
 * VAULT_PASSWORD: string;
 * VAULT_UNSEAL_KEY_1: string;
 * }} PlainEnvs
 */

/**
 * @typedef {{
 * project: {
 *  lib: string;
 *  root: string;
 *  name: string;
 *  version: string;
 * };
 * docker: {
 *  registryUrl: string;
 *  platform?: string;
 * };
 * REMOTE_PROJECT_ROOT: string;
 * TARGET_ENV: string;
 * ssh: import("../../../lib/ssh/types.mjs").SSH;
 * vault: import("../../../lib/secrets/types.mjs").Vault;
 * }} TreeEnvs
 */
