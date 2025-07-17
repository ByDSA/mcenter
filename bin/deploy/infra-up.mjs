#!/usr/bin/env zx
// @ts-check

import {
  readAndCheckEnvs
} from "../../packages/lib/projects/deploy/index.mjs";
import { infraUp } from "../../packages/lib/index.mjs";


  const { ENVS } = await readAndCheckEnvs();

  if (ENVS.TARGET_ENV === "local") {
    console.error("Cannot upload infrastructure to local environment");
    process.exit(1);
  }

  const { ssh } = ENVS;

  await infraUp( {
    projectRoot: ENVS.project.root,
    remoteProjectRoot: ENVS.REMOTE_PROJECT_ROOT,
    ssh,
  } );

