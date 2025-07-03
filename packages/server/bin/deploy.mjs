#!/usr/bin/env zx

// @ts-check
import { deployProjectBegin, deployProjectEnd } from "../../lib/index.mjs";
import { deployParticular } from "../lib/deploy-particular.mjs";

$.verbose = false;

const { ENVS } = await deployProjectBegin();

await deployParticular( {
  ...ENVS,
} );

await deployProjectEnd( {
  ...ENVS,
} );
