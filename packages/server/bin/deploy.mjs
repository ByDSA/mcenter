#!/usr/bin/env zx

// @ts-check
import { readAndCheckEnvs, deployProjectEnd } from "../../lib/projects/deploy/index.mjs";
import { deployParticular } from "../lib/deploy-particular.mjs";

$.verbose = false;

const { ENVS } = await readAndCheckEnvs();

await deployParticular( {
  ...ENVS,
} );

await deployProjectEnd( {
  ...ENVS,
} );
