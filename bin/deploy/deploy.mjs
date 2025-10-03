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
  process.env.FORCE_COLOR = "3";

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

  console.log("Executing shared tests ...");
  // await $`cd ../../packages/shared && pnpm test --forceExit`;
  console.log("Executing server tests ...");
  await $`cd ../../packages/server && pnpm test --forceExit`;
  console.log("Executing shared e2e tests ...");
  await $`cd ../../packages/shared && pnpm test:e2e --forceExit`;

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
