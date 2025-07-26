import { Controller, Get, Param } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { asyncMap } from "$shared/utils/arrays";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { EpisodesRepository } from "#episodes/repositories";
import { Episode, EpisodeEntity } from "#episodes/models";
import { LastTimePlayedService } from "#episodes/history";
import { genRandomPickerWithData } from "#modules/picker";
import { SerieRepository } from "#series/repositories";
import { StreamsRepository } from "#modules/streams/repositories";
import { assertFound } from "#utils/validation/found";
import { EpisodeHistoryEntriesRepository } from "#episodes/history/repositories";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { dependencies } from "./appliers/Dependencies";

class ShowPickerParamsDto extends createZodDto(z.object( {
  streamKey: z.string(),
} )) {}

type ResultType = Episode & {
  percentage: number;
  days: number;
};

@Controller()
export class EpisodePickerController {
  constructor(
     private readonly streamRepository: StreamsRepository,
     private readonly episodeRepository: EpisodesRepository,
     private readonly episodeHistoryEntriesRepository: EpisodeHistoryEntriesRepository,
     private readonly serieRepository: SerieRepository,
     private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @Get("/:streamKey")
  async showPicker(@Param() params: ShowPickerParamsDto) {
    const { streamKey } = params;
    const stream = await this.streamRepository.getOneByKey(streamKey);

    assertFound(stream);
    const lastEntry = await this.episodeHistoryEntriesRepository.findLast( {
      seriesKey: stream.key,
      streamId: stream.id,
    } );

    assertFound(lastEntry);

    const seriePromise = this.serieRepository.getOneByKey(stream.group.origins[0].id);
    const lastEpCompKey = lastEntry.episodeCompKey;
    const lastEpPromise = lastEpCompKey
      ? this.episodeRepository.getOneByCompKey(lastEpCompKey)
      : Promise.resolve(null);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    assertFound(serie);

    const episodes: EpisodeEntity[] = await this.episodeRepository.getManyBySerieKey(serie.key);
    const picker = await genRandomPickerWithData<EpisodeEntity>( {
      resources: episodes,
      lastOne: lastEp ?? undefined,
      filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp ?? undefined),
      weightFixerApplier: genEpisodeWeightFixerApplier(),
    } );
    const pickerWeight = picker.weight;
    const ret = (await asyncMap(
      picker.data,
      async (e: EpisodeEntity) => {
        const selfWeight = picker.getWeight(e);

        assertIsDefined(selfWeight);
        const percentage = (selfWeight * 100) / pickerWeight;
        const days = Math.floor(await this.lastTimePlayedService.getDaysFromLastPlayed(e));

        return {
          ...e,
          percentage,
          days,
        } as ResultType;
      },
    )).sort((a: ResultType, b: ResultType) => b.percentage - a.percentage);

    return ret;
  }
}
