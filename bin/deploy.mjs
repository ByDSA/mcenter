#!/usr/bin/env node
// @ts-check

import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

import {
  deployProjectBegin,
  deployProjectEnd,
} from "../lib/projects/deploy/index.mjs";
import { frontPackageDeployParticular } from "../packages/front/lib/index.mjs";
import { musicPackageDeployParticular } from "../packages/music/lib/index.mjs";
import { serverPackageDeployParticular } from "../packages/server/lib/index.mjs";

(async () => {
  $.verbose = false;

  const { ENVS } = await deployProjectBegin();

  await serverPackageDeployParticular({
    ...ENVS,
  });
  await musicPackageDeployParticular({
    ...ENVS,
  });

  await frontPackageDeployParticular({
    ...ENVS,
  });

  await deployProjectEnd({
    ...ENVS,
  });
})();
