#!/usr/bin/env node
// @ts-check

/* eslint-disable space-in-parens */
import { dockerImageBuildIfNotExists } from "../../../lib/index.mjs";

/**
 * @typedef {{
 * imageName: string,
 * tag: string,
 * projectRoot:
 * string,
 * dockerPlatform: string,
 * targetEnv: string
 * packageName: string,
 * }} Params
 * @param {Params} params
 */
// eslint-disable-next-line import/prefer-default-export
export async function buildIfNotExists(params) {
  const {
    imageName,
    tag,
    projectRoot,
    dockerPlatform,
    targetEnv,
    packageName,
  } = params;

  await dockerImageBuildIfNotExists({
    imageName,
    tag,
    dockerfilePath: `${projectRoot}/packages/${packageName}/Dockerfile`,
    buildContext: `${projectRoot}/packages`,
    platform: dockerPlatform,
    buildArgs: {
      ENV: targetEnv,
    },
  });
}
