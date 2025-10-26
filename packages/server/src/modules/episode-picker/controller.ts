import { Controller, Get, Param } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { asyncMap } from "$shared/utils/arrays";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { Episode, EpisodeEntityWithUserInfo } from "#episodes/models";
import { LastTimePlayedService } from "#episodes/history";
import { SeriesRepository } from "#modules/series/crud/repository";
import { StreamsRepository } from "#modules/streams/crud/repository";
import { assertFoundClient } from "#utils/validation/found";
import { EpisodeHistoryRepository } from "#episodes/history/crud/repository";
import { getSeriesKeyFromStream } from "#modules/streams";
import { EpisodeDependenciesRepository } from "#episodes/dependencies/crud/repository";
import { genRandomPickerWithData } from "#modules/picker/resource-picker/resource-picker-random";
import { EpisodesUsersRepository } from "#episodes/crud/repositories/user-infos";
import { User } from "#core/auth/users/User.decorator";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
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
     private readonly episodesUsersRepo: EpisodesUsersRepository,
     private readonly dependenciesRepo: EpisodeDependenciesRepository,
     private readonly historyRepo: EpisodeHistoryRepository,
     private readonly seriesRepo: SeriesRepository,
     private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @Authenticated()
  @Get("/:streamKey")
  async showPicker(
    @Param() params: ShowPickerParamsDto,
    @User() user: UserPayload,
  ) {
    const { streamKey } = params;
    const stream = await this.streamsRepo.getOneByKey(user.id, streamKey);

    assertFoundClient(stream);
    const lastEntry = await this.historyRepo.findLast( {
      streamId: stream.id,
    } );

    assertFoundClient(lastEntry);

    const seriesKey = getSeriesKeyFromStream(stream);

    assertIsDefined(seriesKey);
    const seriePromise = this.seriesRepo.getOneByKey(seriesKey);
    const lastEpId = lastEntry.resourceId;
    const lastEpPromise = lastEpId
      ? this.episodesRepo.getOneById(lastEpId)
      : Promise.resolve(null);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp: EpisodeEntityWithUserInfo = await lastEpPromise as any;

    assertFoundClient(serie);

    const dependencies = dependenciesToList(await this.dependenciesRepo.getAll());
    const episodes: EpisodeEntityWithUserInfo[] = await this.episodesUsersRepo
      .getFullSerieForUser( {
        seriesKey: serie.key,
        userId: user.id,
      } );
    const picker = await genRandomPickerWithData<
        EpisodeEntityWithUserInfo,
        EpisodeEntityWithUserInfo
      >( {
        resources: episodes,
        lastOne: lastEp ?? undefined,
        filterApplier: genEpisodeFilterApplier(episodes, dependencies, lastEp ?? undefined),
        weightFixerApplier: genEpisodeWeightFixerApplier(),
      } );
    const pickerWeight = picker.weight;
    const ret = (await asyncMap(
      picker.data,
      async (e: EpisodeEntityWithUserInfo) => {
        const selfWeight = picker.getWeight(e);

        assertIsDefined(selfWeight);
        const percentage = (selfWeight * 100) / pickerWeight;
        const days = Math.floor(await this.lastTimePlayedService.getDaysFromLastPlayed(e.userInfo));

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
