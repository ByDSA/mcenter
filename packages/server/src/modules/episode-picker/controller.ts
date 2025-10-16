import { Controller, Get, Param } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { asyncMap } from "$shared/utils/arrays";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { EpisodesRepository } from "#episodes/crud/repository";
import { Episode, EpisodeEntity } from "#episodes/models";
import { LastTimePlayedService } from "#episodes/history";
import { SeriesRepository } from "#modules/series/crud/repository";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { assertFoundClient } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { getSeriesKeyFromStream } from "#modules/streams";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { genRandomPickerWithData } from "#modules/picker/resource-picker/resource-picker-random";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";
import { dependenciesToList } from "./appliers/dependencies";

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
     private readonly streamsRepo: StreamsRepository,
     private readonly episodesRepo: EpisodesRepository,
     private readonly dependenciesRepo: EpisodeDependenciesRepository,
     private readonly historyRepo: EpisodeHistoryRepository,
     private readonly seriesRepo: SeriesRepository,
     private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @Get("/:streamKey")
  async showPicker(@Param() params: ShowPickerParamsDto) {
    const { streamKey } = params;
    const stream = await this.streamsRepo.getOneByKey(streamKey);

    assertFoundClient(stream);
    const lastEntry = await this.historyRepo.findLast( {
      seriesKey: stream.key,
      streamId: stream.id,
    } );

    assertFoundClient(lastEntry);

    const seriesKey = getSeriesKeyFromStream(stream);

    assertIsDefined(seriesKey);
    const seriePromise = this.seriesRepo.getOneByKey(seriesKey);
    const lastEpCompKey = lastEntry.resourceId;
    const lastEpPromise = lastEpCompKey
      ? this.episodesRepo.getOneByCompKey(lastEpCompKey)
      : Promise.resolve(null);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    assertFoundClient(serie);

    const dependencies = dependenciesToList(await this.dependenciesRepo.getAll());
    const episodes: EpisodeEntity[] = await this.episodesRepo.getManyBySerieKey(serie.key);
    const picker = await genRandomPickerWithData<EpisodeEntity, EpisodeEntity>( {
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
