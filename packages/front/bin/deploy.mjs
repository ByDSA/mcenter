#!/usr/bin/env zx
// @ts-check
import { readAndCheckEnvs, deployProjectEnd } from "../../lib/index.mjs";
import { deployParticular } from "../lib/deploy-particular.mjs";

(async () => {
  $.verbose = false;

  const { ENVS } = await readAndCheckEnvs();

  await deployParticular( {
    ...ENVS,
  } );

  await deployProjectEnd( {
    ...ENVS,
  } );
} )();
