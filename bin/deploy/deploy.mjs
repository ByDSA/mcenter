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

  console.log('Argumentos recibidos:', argv);

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


  // --no-tests para saltarse los tests
  const haveToDoTests = argv['tests'] === undefined || argv['tests'] === true;
  if (haveToDoTests) {
    $.verbose = true;
    await $`echo "Executing shared tests ..."`;
    // await $`cd ../../packages/shared && pnpm test --forceExit`;
    await $`echo "Executing server tests ..."`;
    await $`cd ../../packages/server && pnpm test --forceExit`;
    await $`echo "Executing shared e2e tests ..."`;
    await $`cd ../../packages/shared && pnpm test:e2e --forceExit`;
  }
  await serverPackageDeployParticular({
    ...ENVS,
  }, {
    noMigrations: !!argv['no-migrations'],
  });
  await frontPackageDeployParticular({
    ...ENVS,
  });

  await deployProjectEnd({
    ...ENVS,
  });
})();
