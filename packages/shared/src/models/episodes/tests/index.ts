import { Episode } from "../episode";
import { EpisodeCompKey } from "../episode";

export function expectEpisodes(actual: Episode[], expected: Episode[]) {
  expect(actual).toHaveLength(expected.length);

  for (let i = 0; i < actual.length; i++)
    expectEpisode(actual[i], expected[i]);
}

export function expectEpisode(actual: Episode, expected: Episode) {
  expect(actual).toEqual(expected);
}

export function stringifyEpisodeCompKey(episodeCompKey: EpisodeCompKey): string {
  return `(${episodeCompKey.seriesKey}; ${episodeCompKey.episodeKey})`;
}

export * from "./fixtures";
