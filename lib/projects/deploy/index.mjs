// @ts-check

import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

import { assertEnv, loadEnvsFile } from "../../envs/index.mjs";
import {
  assertSshEnvs,
  assertVaultEnvs,
  infraUp,
  showParams,
  sshCmd,
} from "../../index.mjs";
import { loadProjectEnvs } from "../../projects/envs.mjs";

/**
 *
 * @param {string} TARGET_ENV
 */
export async function loadDeployEnvs(TARGET_ENV) {
  process.env.TARGET_ENV = TARGET_ENV;
  assertEnv("TARGET_ENV");

  await loadProjectEnvs();

  if (TARGET_ENV !== "local") {
    const CI = process.env.CI;
    if (CI === undefined) {
      const TARGET_ENVS_PATH =
        process.env.PROJECT_ROOT + "/bin/deploy.env." + TARGET_ENV;

      await loadEnvsFile(TARGET_ENVS_PATH);
    }

    assertEnv("DOCKER_REGISTRY_URL");
    assertEnv("DOCKER_PLATFORM");
    assertEnv("REMOTE_PROJECT_ROOT");

    assertSshEnvs();
    assertVaultEnvs();
  }
}

/**
 * @param {import("./types.mjs").TreeEnvs} ENVS
 */
export async function deployProjectEnd(ENVS) {
  if (ENVS.TARGET_ENV !== "local") {
    const { ssh } = ENVS;

    // Reload (remote)
    console.log("Remote: runing (or reloading) container ...");
    await sshCmd({
      cmd: `${ENVS.REMOTE_PROJECT_ROOT}/bin/run`,
      ssh,
    });
  } else {
    // Reload
    console.log("Runing (or reloading) container ...");
    await $`${ENVS.project.root}/bin/run`;
  }

  console.log("Done!");
}

/**
 * @returns {Promise<{ENVS: import("./types.mjs").TreeEnvs}>}
 */
export async function deployProjectBegin() {
  const TARGET_ENV = process.argv[2] ?? "local";
  /** @type {import("./types.mjs").TreeEnvs} */
  let ENVS = await loadEnvs(TARGET_ENV);

  showParams(ENVS);

  if (ENVS.TARGET_ENV !== "local") {
    const { ssh } = ENVS;
    // rsync infrastructure
    await infraUp({
      projectRoot: ENVS.project.root,
      remoteProjectRoot: ENVS.REMOTE_PROJECT_ROOT,
      ssh,
    });
  }

  return {
    ENVS,
  };
}

/**
 *
 * @param {string} targetEnv
 * @returns {Promise<import("./types.mjs").TreeEnvs>}
 */
async function loadEnvs(targetEnv) {
  await loadDeployEnvs(targetEnv);

  process.env = Object.freeze({
    ...process.env,
  });

  const ssh = {
    host: process.env.SSH_HOST,
    user: process.env.SSH_USER,
    keyFile: process.env.SSH_KEYFILE,
  };

  const vault = {
    addr: process.env.VAULT_ADDR,
    username: process.env.VAULT_USERNAME,
    password: process.env.VAULT_PASSWORD,
    unsealKeys: [process.env.VAULT_UNSEAL_KEY_1],
  };

  return {
    project: {
      lib: process.env.PROJECT_LIB,
      root: process.env.PROJECT_ROOT,
      name: process.env.PROJECT_NAME,
      version: process.env.PROJECT_VERSION,
    },
    docker: {
      platform: process.env.DOCKER_PLATFORM,
      registryUrl: process.env.DOCKER_REGISTRY_URL,
    },
    REMOTE_PROJECT_ROOT: process.env.REMOTE_PROJECT_ROOT,
    TARGET_ENV: process.env.TARGET_ENV,
    ssh,
    vault,
  };
}
