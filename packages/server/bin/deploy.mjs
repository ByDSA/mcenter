#!/usr/bin/env zx

// @ts-check
import { readAndCheckEnvs, deployProjectEnd } from "../../lib/projects/deploy/index.mjs";
import { deployParticular } from "../lib/deploy-particular.mjs";

$.verbose = false;

const { ENVS } = await readAndCheckEnvs();

$.verbose = true;
await echo("Executing server tests");
$.verbose = false;
await $`cd ../../packages/server && pnpm test --forceExit`;

await deployParticular( {
  ...ENVS,
} );

await deployProjectEnd( {
  ...ENVS,
} );
