// @ts-check

import { $ } from "/home/prog/.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

import { imageExists } from "./image-exists.mjs";

/**
 * @typedef {({ taggedImage: string } | {imageName: string, tag: string}) & {
 * dockerfilePath?: string,
 * buildContext?: string,
 * platform?: string,
 * buildArgs?: {[key:string]: string}
 * replace: boolean
 * }} Params
 * @param {Params} params
 */
export async function imageBuild(params) {
  const {
    dockerfilePath,
    buildContext: buildContextArg,
    buildArgs,
    platform,
    replace,
  } = params;
  let taggedImage = calcTaggedImageFromParams(params);

  let haveToBuild = true;
  if (!replace) {
    haveToBuild = !await imageExists({
      taggedImage,
    });

    if (!haveToBuild) {
      console.log(`Image ${taggedImage} already exists. Not built.`);
      return;
    }
  }

  let buildContext = buildContextArg ?? ".";

  console.log("Building image " + taggedImage + "...");

  const cmd = ["docker", "buildx", "build", buildContext, "--load"];

  if (dockerfilePath) {
    cmd.push("-f", dockerfilePath);
  }

  cmd.push("-t", taggedImage);

  if (platform) {
    cmd.unshift("DOCKER_BUILDKIT=1");
    cmd.push("--platform", platform);
  }

  if (buildArgs) {
    for (const [key, value] of Object.entries(buildArgs)) {
      if (value !== undefined) cmd.push("--build-arg", `${key}=${value}`);
    }
  }
  await $`${cmd}`;
}

/**
 *
 * @param {Params} params
 * @returns string
 */
function calcTaggedImageFromParams(params) {
  if ("taggedImage" in params) {
    return params.taggedImage;
  } else {
    const { imageName, tag } = params;
    return `${imageName}:${tag}`;
  }
}
