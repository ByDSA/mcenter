import { Episode } from "../Entity";

export function expectEpisodes(episodes1: Episode[], episodes2: Episode[]) {
  expect(episodes1).toHaveLength(episodes2.length);

  for (let i = 0; i < episodes1.length; i++)
    expectEpisode(episodes1[i], episodes2[i]);
}

export function expectEpisode(episode1: Episode, episode2: Episode) {
  expect(episode1).toEqual(episode2);
}
