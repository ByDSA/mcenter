#!/usr/bin/env node
// @ts-check

/* eslint-disable space-in-parens */
import { dockerImageBuild } from "../../../lib/index.mjs";

/**
 * @typedef {{
 * imageName: string,
 * tag: string,
 * projectRoot:
 * string,
 * dockerPlatform: string,
 * targetEnv: string
 * packageName: string,
 * replace: boolean
 * }} Params
 * @param {Params} params
 */
// eslint-disable-next-line import/prefer-default-export
export async function build(params) {
  const {
    imageName,
    tag,
    projectRoot,
    dockerPlatform,
    targetEnv,
    packageName,
    replace,
  } = params;

  await dockerImageBuild({
    imageName,
    tag,
    dockerfilePath: `${projectRoot}/packages/${packageName}/Dockerfile`,
    buildContext: `${projectRoot}/packages`,
    platform: dockerPlatform,
    buildArgs: {
      ENV: targetEnv,
    },
    replace,
  });
}
