import { assertIsDefined } from "$shared/utils/validation";
import { MediaElement } from "#modules/models";

export function completeMediaElement(e: MediaElement): MediaElement {
  const { MEDIA_PATH } = process.env;

  assertIsDefined(MEDIA_PATH);

  const length = calculateLength(e);

  return {
    path: `${MEDIA_PATH}/${e.path}`,
    title: e.title,
    startTime: e.startTime,
    stopTime: e.stopTime,
    length,
  };
}

function calculateLength(e: MediaElement): number {
  let length = -1;
  const end = e.stopTime ?? -1;
  const start = e.startTime ?? 0;

  if (end === -1)
    return -1;

  length = end - start;

  return length;
}
