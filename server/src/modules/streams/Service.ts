import { Episode, calculateNextEpisode } from "#modules/episodes";
import { Model } from "./models";

export default class Service {
  async pickNextEpisode(model: Model, n = 1): Promise<Episode[]> {
    const episodes: Episode[] = [];

    for (let i = 0; i < n; i++) {
      // eslint-disable-next-line no-await-in-loop
      const episode = await calculateNextEpisode( {
        stream:model,
      } );

      episodes.push(episode);
    }

    return episodes;
  }
}