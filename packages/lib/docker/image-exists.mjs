// @ts-check
import { $ } from "../../../../../../.nvm/versions/node/v20.8.0/lib/node_modules/zx/build/index.js";

/**
 * @typedef {{imageName: string; tag?: string}| {taggedImage: string}} Params
 * @param {Params} params
 */
export async function imageExists(params) {
  let taggedImage;

  if ("taggedImage" in params)
    taggedImage = params.taggedImage;
  else {
    const tag = params.tag ?? "latest";

    taggedImage = `${params.imageName}:${tag}`;
  }

  const result = (
    await $`docker images -q ${taggedImage} 2>/dev/null`
  ).stdout.trim();

  return !!result;
}
