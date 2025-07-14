import { Episode } from "../episode";

export function expectEpisodes(actual: Episode[], expected: Episode[]) {
  expect(actual).toHaveLength(expected.length);

  for (let i = 0; i < actual.length; i++)
    expectEpisode(actual[i], expected[i]);
}

export function expectEpisode(actual: Episode, expected: Episode) {
  expect(actual).toEqual(expected);
}
