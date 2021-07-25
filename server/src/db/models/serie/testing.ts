/* eslint-disable import/prefer-default-export */
import { checkResource } from "../resource";
import { VideoInterface } from "../video";
import Doc from "./document";
import Interface from "./interface";

export function check(actual: Doc | null, expected: Interface) {
  checkResource(actual, expected);

  if (!actual)
    throw new Error();

  for (let i = 0; i < actual.episodes.length; i++) {
    const actualEpisode: VideoInterface = actual.episodes[i];
    const expectedEpisode = expected?.episodes[i];

    checkResource(actualEpisode, expectedEpisode);
  }
}
