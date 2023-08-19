/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-await-in-loop */
import { HistoryRepository } from "#modules/history";
import { Episode, calculateNextEpisode, episodeToMediaElement } from "#modules/series/episode";
import { Stream } from "#modules/stream";
import VLCService from "./PlayService";
import { MediaElement } from "./player";

type PlayOptions = {
  force?: boolean;
};
export default class PlayService {
  constructor(private vlcService: VLCService) {
  }

  async play(episodes: Episode[], options?: PlayOptions) {
    if (episodes.length === 0)
      throw new Error("No episodes to play");

    const elements: MediaElement[] = episodes.map(episodeToMediaElement);
    const vlcServiceOptions = {
      openNewInstance: options?.force ?? false,
    };

    await this.vlcService.play(elements, vlcServiceOptions);
  }
}

export async function pickAndAddHistory(stream: Stream, n: number): Promise<Episode[]> {
  const episodes: Episode[] = [];

  for (let i = 0; i < n; i++) {
    const episode = await calculateNextEpisode(stream);

    await HistoryRepository.getInstance<HistoryRepository>().addToHistory(stream, episode);
    episodes.push(episode);
  }

  return episodes;
}
