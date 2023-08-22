import { Episode, calculateNextEpisode } from "#modules/series/episode";
import { StreamWithHistoryList } from "./model";

/**
 * @deprecated
 */
export default class StreamService {
  async pickNextEpisode(streamWithHistoryList: StreamWithHistoryList, n = 1): Promise<Episode[]> {
    const episodes: Episode[] = [];

    for (let i = 0; i < n; i++) {
      // eslint-disable-next-line no-await-in-loop
      const episode = await calculateNextEpisode(streamWithHistoryList);

      episodes.push(episode);
    }

    return episodes;
  }
}