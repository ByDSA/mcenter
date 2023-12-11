/* eslint-disable import/prefer-default-export */
/* eslint-disable object-curly-newline */
/* eslint-disable space-in-parens */
// @ts-check

// @ts-ignore
// eslint-disable-next-line import/no-absolute-path

import {
  dockerImagePush,
  dockerImageTag,
  packageBuildIfNotExists,
  remoteDockerImagePull,
  sshCmd,
} from "../../../lib/index.mjs";

/**
 * @param {import("../../../lib/projects/deploy/types.mjs").TreeEnvs} params
 */
export async function deployParticular(params) {
  const packageName = "front";
  const packageVersion = process.env.PROJECT_VERSION;
  const { ssh } = params;
  const imageName = `${params.project.name}/${packageName}`;
  const imageNameEnv = `${imageName}_${params.TARGET_ENV}`;
  const tag = packageVersion;
  const imageNameEnvRemote =
    params.TARGET_ENV === "local"
      ? imageNameEnv
      : `${params.docker.registryUrl}/${imageNameEnv}`;

  // Image Build
  await packageBuildIfNotExists({
    dockerPlatform: params.docker.platform,
    projectRoot: params.project.root,
    packageName,
    imageName: imageNameEnvRemote,
    tag,
    targetEnv: params.TARGET_ENV,
  });

  if (params.TARGET_ENV !== "local") {
    // Image Push
    await dockerImagePush({
      imageName: imageNameEnv,
      dockerRegistryUrl: params.docker.registryUrl,
      tag,
    });

    // Pull image (remote)
    await remoteDockerImagePull({
      ssh,
      imageName: imageNameEnvRemote,
      tag,
    });

    // Update image latest tag (remote)
    const taggedImageEnvRegistry = `${imageNameEnvRemote}:${tag}`;

    console.log(
      // eslint-disable-next-line comma-dangle
      `Remote: docker image tag ${imageName} -> ${taggedImageEnvRegistry} ...`
    );
    await sshCmd({
      cmd: `sudo docker tag "${taggedImageEnvRegistry}" "${imageName}"`,
      ssh,
    });
  } else {
    await dockerImageTag({
      sourceImageName: imageNameEnv,
      targetImageName: imageName,
      sourceImageTag: tag,
    });
  }
}
