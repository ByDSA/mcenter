import { Request } from "express";
import { Controller, Get, Query, Req, UseInterceptors } from "@nestjs/common";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsRepository } from "../crud/repository";
import { requestToFindMusicParams } from "../crud/repository/queries/queries";
import { ResponseFormatInterceptor } from "../../resources/response-formatter/response-format.interceptor";
import { M3u8FormatUseNext } from "../../resources/response-formatter/use-next.decorator";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "./model";
import { assertIsNotEmptyClient } from "#utils/validation/found";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { Music, MusicEntity } from "#musics/models";

@Controller("/")
export class MusicGetRandomController {
  constructor(
    private readonly musicHistoryRepo: MusicHistoryRepository,
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  @Get("/")
  @UseInterceptors(ResponseFormatInterceptor)
  @M3u8FormatUseNext()
  async getRandom(
    @Req() req: Request,
    @Query("token") token: string | undefined,
  ): Promise<Music> {
    mongoDbId.or(z.undefined()).parse(token);
    const musics = await this.#findMusics(req);

    assertIsNotEmptyClient(musics);
    const picked = await this.#randomPick(token, musics);

    return picked;
  }

  async #getLastMusicInHistory(userId: string): Promise<MusicEntity | null> {
    const lastOneEntry = await this.musicHistoryRepo.getLast(userId);

    if (!lastOneEntry)
      return null;

    const lastOne = await this.musicRepo.getOneById(lastOneEntry.resourceId);

    return lastOne;
  }

  async #randomPick(
    userId: string | undefined,
    musics: MusicEntity[],
    n: number = 1,
  ): Promise<MusicEntity> {
    const lastOne = (userId ? await this.#getLastMusicInHistory(userId) : undefined) ?? undefined;
    const picker = new ResourcePickerRandom<MusicEntity>( {
      resources: musics,
      lastOne,
      filterApplier: genMusicFilterApplier(musics, lastOne),
      weightFixerApplier: genMusicWeightFixerApplier(),
    } );
    let [picked] = await picker.pick(n);

    // default case
    if (!picked)
      [picked] = musics;

    return picked;
  }

  #findMusics(req: Request): Promise<MusicEntity[]> {
    const params = requestToFindMusicParams(req);

    if (params)
      return this.musicRepo.getManyByQuery(params);

    return this.musicRepo.getAll();
  }
}
