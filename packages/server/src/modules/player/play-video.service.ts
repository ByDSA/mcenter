import type { QueryDto } from "./play-stream/controller";
import { Injectable } from "@nestjs/common";
import { EpisodeEntityWithFileInfos, episodeEntityWithFileInfosSchema } from "$sharedSrc/models/episodes";
import { episodeToMediaElement } from "$sharedSrc/models/player";
import { mediaElementFixPlayerLabels } from "$sharedSrc/models/resources";
import { assertZod } from "$sharedSrc/utils/validation/zod";
import z from "zod";
import { assertFound } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { EpisodePickerService } from "#modules/episode-picker";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { EpisodeCompKey, EpisodeEntity } from "#episodes/models";
import { EpisodesRepository } from "#episodes/crud/repository";
import { SeriesRepository } from "#modules/series/crud/repository";
import { PlayService } from "./play.service";

@Injectable()
export class PlayVideoService {
  constructor(
    private readonly episodePickerService: EpisodePickerService,
    private readonly streamsRepo: StreamsRepository,
    private readonly historyRepo: EpisodeHistoryRepository,
    private readonly seriesRepo: SeriesRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly playService: PlayService,
  ) { }

  private async processAndPlayEpisodes(
    episodes: EpisodeEntityWithFileInfos[],
    streamId: string,
    force?: boolean,
  ): Promise<EpisodeEntityWithFileInfos[]> {
    assertFound(episodes[0]);
    assertZod(z.array(episodeEntityWithFileInfosSchema), episodes);

    const mediaElements = episodes.map((e) => {
      const mediaElement = episodeToMediaElement(e, {
        local: true,
      } );

      // TODO: quitar de db "series" del path y ponerlo aquí
      mediaElement.path =`${mediaElement.path}`;

      return mediaElementFixPlayerLabels(mediaElement);
    });

    await this.playService.play( {
      mediaElements,
      force,
    } );

    const isLast = await this.historyRepo.isLast(episodes[0].compKey);

    const episodesToAddInHistory: EpisodeEntity[] = isLast
      ? episodes.slice(1)
      :  episodes;

    await this.historyRepo.addEpisodesToHistory( {
      episodes: episodesToAddInHistory,
      streamId,
    } );

    return episodes;
  }

  async playEpisodeStream(
    streamId: string,
    number: number,
    query: QueryDto,
  ) {
    const { force } = query;
    const stream = await this.streamsRepo.getOneByKey(streamId);

    assertFound(stream);

    const episodes = (await this.episodePickerService.getByStream(stream, number, {
      expand: ["series", "fileInfos"],
    } ))
      .filter(Boolean) as EpisodeEntityWithFileInfos[];

    return this.processAndPlayEpisodes(episodes, stream.id, force);
  }

  async playEpisode(
    episodeCompKey: EpisodeCompKey,
    query: QueryDto,
  ) {
    const { force } = query;
    const { episodeKey, seriesKey } = episodeCompKey;
    const serie = await this.seriesRepo.getOneByKey(seriesKey);

    assertFound(serie);

    const episodes = [await this.episodesRepo
      .getOneByCompKey( {
        seriesKey,
        episodeKey,
      }, {
        expand: ["series", "fileInfos"],
      } )]
      .filter(Boolean) as EpisodeEntityWithFileInfos[];
    const stream = await this.streamsRepo.getOneOrCreateBySeriesKey(seriesKey);

    return this.processAndPlayEpisodes(episodes, stream.id, force);
  }
}
