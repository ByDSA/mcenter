// @ts-check
import { $ } from "../../../../../../.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 *
 * @typedef {Object} Params
 * @property {string} sourceImageName
 * @property {string} [sourceImageTag]
 * @property {string} [targetImageName]
 * @property {string} [targetImageTag]
 * @param {Params} params
 */
export async function imageTag(params) {
  const {
    sourceImageName,
    targetImageName: targetImageNameArg,
    sourceImageTag = "latest",
    targetImageTag = "latest",
  } = params;
  const targetImageName = targetImageNameArg ?? sourceImageName;

  console.log(
    `Tagging image ${sourceImageName}:${sourceImageTag} <- ${targetImageName}:${targetImageTag} ...`,
  );

  const imageFull = `${sourceImageName}:${sourceImageTag}`;
  const imageFullLatest = `${targetImageName}:${targetImageTag}`;

  await $`sudo docker tag "${imageFull}" "${imageFullLatest}"`;
}
