#!/usr/bin/env zx
// @ts-check

import {
  readAndCheckEnvs,
  deployProjectEnd,
} from "../../packages/lib/projects/deploy/index.mjs";
import { frontPackageDeployParticular } from "../../packages/front/lib/index.mjs";
import { serverPackageDeployParticular } from "../../packages/server/lib/index.mjs";
import { infraUp } from "../../packages/lib/index.mjs";

(async () => {
  $.verbose = false;

  const { ENVS } = await readAndCheckEnvs();

  if (ENVS.TARGET_ENV !== "local") {
    const { ssh } = ENVS;

    // rsync infrastructure
    await infraUp( {
      projectRoot: ENVS.project.root,
      remoteProjectRoot: ENVS.REMOTE_PROJECT_ROOT,
      ssh,
    } );
  }

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
