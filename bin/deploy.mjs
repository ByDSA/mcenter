#!/usr/bin/env zx
// @ts-check

import {
  deployProjectBegin,
  deployProjectEnd,
} from "../packages/lib/projects/deploy/index.mjs";
import { frontPackageDeployParticular } from "../packages/front/lib/index.mjs";
import { serverPackageDeployParticular } from "../packages/server/lib/index.mjs";

(async () => {
  $.verbose = false;

  const { ENVS } = await deployProjectBegin();

  await serverPackageDeployParticular({
    ...ENVS,
  });
  await frontPackageDeployParticular({
    ...ENVS,
  });

  await deployProjectEnd({
    ...ENVS,
  });
})();
