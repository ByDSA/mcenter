#!/usr/bin/env zx
// @ts-check

import { join } from "node:path";
import { assertFileExists } from "../lib/fs/index.mjs";
import { assertEnv } from "../lib/index.mjs";
import { loadProjectEnvs } from "../lib/projects/envs.mjs";

// @ts-ignore
(async () => {
  // @ts-ignore
  $.verbose = false;
  // @ts-ignore
  const DIR = join(new URL(import.meta.url).pathname, "..");

  await loadProjectEnvs();

  const FILE_YML = `${DIR}/docker/docker-compose.yml`;
  assertFileExists(FILE_YML);

  assertEnv("ENV");
  assertEnv("MCENTER_FRONT_PORT");
  assertEnv("MCENTER_SERVER_PORT");
  assertEnv("MCENTER_SERVER_MEDIA_PATH");
  const envs = [
    "MCENTER_FRONT_PORT",
    "MCENTER_SERVER_PORT",
    "MCENTER_SERVER_MEDIA_PATH",
  ];

  const envsCmd = [];
  for (const env of envs) {
    envsCmd.push(`${env}=${process.env[env]}`);
  }
  // @ts-ignore
  await $`${envsCmd} docker compose -f "${FILE_YML}" --profile ${process.env.ENV} up -d`;
})().catch(console.error);
