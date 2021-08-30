/* eslint-disable import/prefer-default-export */
import { checkResource } from "../resource";
import Doc from "./document";
import Interface, { Episode } from "./interface";

export function check(actual: Doc | null, expected: Interface) {
  checkResource(actual, expected);

  if (!actual)
    throw new Error();

  expect(actual.episodes?.length).toBe(expected.episodes?.length);

  for (let i = 0; i < actual.episodes.length; i++) {
    const actualEpisode: Episode = actual.episodes[i];
    const expectedEpisode = expected?.episodes[i];

    // eslint-disable-next-line no-underscore-dangle
    expect(actualEpisode._id).toBe(expectedEpisode._id);
    checkEpisode(actualEpisode, expectedEpisode);
  }
}

export function checkEpisode(actual: Episode | null, expected: Episode) {
  return checkResource(actual, expected);
}
