import { Picker } from "rand-picker";
import { Controller, Get, Param } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { asyncMap } from "$shared/utils/arrays";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { EpisodeRepository } from "#episodes/index";
import { Episode, EpisodeEntity } from "#episodes/models";
import { EpisodeHistoryListRepository, LastTimePlayedService } from "#episodes/history";
import { genRandomPickerWithData } from "#modules/picker";
import { SerieRepository } from "#modules/series";
import { StreamsRepository } from "#modules/streams/repositories";
import { assertFound } from "#utils/validation/found";
import { dependencies } from "./appliers/Dependencies";
import { genEpisodeFilterApplier, genEpisodeWeightFixerApplier } from "./appliers";

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
     private streamRepository: StreamsRepository,
     private episodeRepository: EpisodeRepository,
     private historyListRepository: EpisodeHistoryListRepository,
     private serieRepository: SerieRepository,
  ) {
  }

  @Get("/:streamId")
  async showPicker(@Param() params: ShowPickerParamsDto) {
    const { streamId } = params;
    const stream = await this.streamRepository.getOneById(streamId);

    assertFound(stream);
    const historyList = await this.historyListRepository.getOneByIdOrCreate(streamId);

    assertFound(historyList);

    const seriePromise = this.serieRepository.getOneById(stream.group.origins[0].id);
    const lastEpId = historyList.entries.at(-1)?.episodeId;
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
    const lastTimePlayedService = new LastTimePlayedService(this.episodeRepository);
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
        const days = Math.floor(await lastTimePlayedService.getDaysFromLastPlayed(e, historyList));

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
