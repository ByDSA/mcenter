import { Picker } from "rand-picker";
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
  streamId: z.string(),
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

  @Get("/:streamId")
  async showPicker(@Param() params: ShowPickerParamsDto) {
    const { streamId } = params;
    const stream = await this.streamRepository.getOneById(streamId);

    assertFound(stream);
    const lastEntry = await this.episodeHistoryEntriesRepository.findLastForSerieId(streamId);

    assertFound(lastEntry);

    const seriePromise = this.serieRepository.getOneById(stream.group.origins[0].id);
    const lastEpId = lastEntry.episodeId;
    const lastEpPromise = lastEpId
      ? this.episodeRepository.getOneById(lastEpId)
      : Promise.resolve(null);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    assertFound(serie);

    const episodes: EpisodeEntity[] = await this.episodeRepository.getManyBySerieId(serie.id);
    const picker = await genRandomPickerWithData<EpisodeEntity>( {
      resources: episodes,
      lastOne: lastEp ?? undefined,
      filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp ?? undefined),
      weightFixerApplier: genEpisodeWeightFixerApplier(),
    } );
    const pickerWeight = picker.weight;
    const ret = (await asyncMap(
      "end" in picker.data[0]
        ? (picker as Picker<EpisodeEntity>).data.filter(
          (e) => e.end === undefined || e.end < 100,
        )
        : picker.data,
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
