// @ts-check
import { $ } from "../../../../../../.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";
import { imageTag } from "./image-tag.mjs";
import { loginIfNot } from "./login.mjs";

/**
 * @typedef {Object} Params
 * @property {string} dockerRegistryUrl
 * @property {string} [imageName]
 * @property {string} tag
 * @param {Params} params
 */
export async function imageTagAndPush(params) {
  const { dockerRegistryUrl, imageName: imageNameArg, tag } = params;
  const { PROJECT_NAME, PACKAGE_NAME } = process.env;
  let imageName = imageNameArg;

  if (!imageName) {
    if (!PROJECT_NAME)
      throw new Error("PROJECT_NAME is required");

    if (!PACKAGE_NAME)
      throw new Error("PACKAGE_NAME is required");

    imageName = `${PROJECT_NAME}/${PACKAGE_NAME}`;
  }

  await imageTag( {
    sourceImageName: imageName,
    sourceImageTag: tag,
    targetImageName: `${dockerRegistryUrl}/${imageName}`,
    targetImageTag: tag,
  } );

  await imagePush(params);
}

/**
 *
 * @param {Params} params
 * @returns Promise<unknown>
 */
export async function imagePush(params) {
  const { dockerRegistryUrl, imageName, tag } = params;
  const imageFull = `${imageName}:${tag}`;
  const remoteImageFull = `${dockerRegistryUrl}/${imageFull}`;

  await loginIfNot( {
    dockerRegistryUrl,
  } );

  console.log("Pushing " + remoteImageFull + " ...");

  return $`${imagePushCmd(params)}`;
}

/**
 *
 * @param {Params} params
 */
export function imagePushCmd(params) {
  const { dockerRegistryUrl, imageName, tag } = params;
  const imageFull = `${imageName}:${tag}`;
  const remoteImageFull = `${dockerRegistryUrl}/${imageFull}`;

  return ["sudo", "docker", "push", remoteImageFull];
}
