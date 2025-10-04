#!/usr/bin/env zx

// @ts-check
import { readAndCheckEnvs, deployProjectEnd } from "../../lib/projects/deploy/index.mjs";
import { deployParticular } from "../lib/deploy-particular.mjs";

$.verbose = false;

const { ENVS } = await readAndCheckEnvs();
const haveToDoTests = argv["tests"] === undefined || argv["tests"] === true;

if (haveToDoTests) {
  $.verbose = true;
  await echo("Executing server tests");
  $.verbose = false;
  await $`cd ../ && pnpm test --forceExit`;
}

await deployParticular( {
  ...ENVS,
} );

await deployProjectEnd( {
  ...ENVS,
} );
