import { Entity as Model } from "../Entity";

export function expectEpisodes(episodes1: Model[], episodes2: Model[]) {
  expect(episodes1).toHaveLength(episodes2.length);

  for (let i = 0; i < episodes1.length; i++)
    expectEpisode(episodes1[i], episodes2[i]);
}

export function expectEpisode(episode1: Model, episode2: Model) {
  expect(episode1).toEqual(episode2);
}