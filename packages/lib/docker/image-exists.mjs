// @ts-check
import { $ } from "zx";

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
