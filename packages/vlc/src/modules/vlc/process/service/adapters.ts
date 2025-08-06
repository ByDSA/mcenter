import { assertIsDefined } from "$shared/utils/validation";
import { MediaElement } from "#modules/models";

export function fixWithAbsolutePath(e: MediaElement): MediaElement {
  const { MEDIA_PATH } = process.env;

  assertIsDefined(MEDIA_PATH);

  return {
    ...e,
    path: `${MEDIA_PATH}/${e.path}`,
  };
}
