import { assertIsDefined } from "#shared/utils/validation";
import { Episode } from "#modules/models/episodes";
import { MediaElement } from "../../media";

export function episodeToMediaElement(e: Episode): MediaElement {
  const { MEDIA_PATH } = process.env;

  assertIsDefined(MEDIA_PATH);

  const length = calculateLength(e);

  return {
    path: `${MEDIA_PATH}/${e.path}`,
    title: e.title,
    startTime: e.start,
    stopTime: e.end,
    length,
  };
}

function calculateLength(e: Episode): number {
  let length = -1;
  const end = e.end ?? -1;
  const start = e.start ?? 0;

  if (end === -1)
    return -1;

  length = end - start;

  return length;
}
