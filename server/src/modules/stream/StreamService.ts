/* eslint-disable class-methods-use-this */
import { Episode, calculateNextEpisode } from "#modules/series/episode";
import { Stream } from "./model";

type Params = {
};
export default class StreamService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(params?: Params) {
  }

  async pickNextEpisode(stream: Stream, n = 1): Promise<Episode[]> {
    const episodes: Episode[] = [];

    for (let i = 0; i < n; i++) {
      // eslint-disable-next-line no-await-in-loop
      const episode = await calculateNextEpisode(stream);

      episodes.push(episode);
    }

    return episodes;
  }
}