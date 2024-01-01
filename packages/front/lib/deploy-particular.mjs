/* eslint-disable import/prefer-default-export */
/* eslint-disable object-curly-newline */
/* eslint-disable space-in-parens */
// @ts-check

// @ts-ignore
// eslint-disable-next-line import/no-absolute-path

import {
  dockerImagePush,
  dockerImageTag,
  packageBuild,
  remoteDockerImagePull,
  sshCmd,
} from "../../../lib/index.mjs";

/**
 * @param {import("../../../lib/projects/deploy/types.mjs").TreeEnvs} ENVS
 */
export async function deployParticular(ENVS) {
  const packageName = "front";
  const packageVersion = ENVS.project.version;
  const { ssh } = ENVS;
  const imageName = `${ENVS.project.name}/${packageName}`;
  const imageNameEnv = `${imageName}_${ENVS.TARGET_ENV}`;
  const tag = packageVersion;
  const imageNameEnvRemote =
    ENVS.TARGET_ENV === "local"
      ? imageNameEnv
      : `${ENVS.docker.registryUrl}/${imageNameEnv}`;

  // Image Build
  await packageBuild({
    dockerPlatform: ENVS.docker.platform,
    projectRoot: ENVS.project.root,
    packageName,
    imageName: imageNameEnvRemote,
    tag,
    targetEnv: ENVS.TARGET_ENV,
    replace: ENVS.docker.replaceImage,
  });

  if (ENVS.TARGET_ENV !== "local") {
    // Image Push
    await dockerImagePush({
      imageName: imageNameEnv,
      dockerRegistryUrl: ENVS.docker.registryUrl,
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
