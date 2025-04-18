#!/usr/bin/env node
// @ts-check
import { $ } from "../../../../../../.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";
import { deployProjectBegin, deployProjectEnd } from "../../../lib/index.mjs";
import { deployParticular } from "../lib/deploy-particular.mjs";

(async () => {
  $.verbose = false;

  const { ENVS } = await deployProjectBegin();

  await deployParticular( {
    ...ENVS,
  } );

  await deployProjectEnd( {
    ...ENVS,
  } );
} )();
