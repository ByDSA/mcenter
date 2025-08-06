import { Request } from "express";
import { Controller, Get, Req, UseInterceptors } from "@nestjs/common";
import { assertIsNotEmpty } from "$shared/utils/validation";
import { Music, MusicEntity } from "#musics/models";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsRepository } from "../crud/repository";
import { requestToFindMusicParams } from "../crud/repository/queries/queries";
import { ResponseFormatInterceptor } from "../../resources/response-formatter/response-format.interceptor";
import { M3u8FormatUseNext } from "../../resources/response-formatter/use-next.decorator";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "./model";

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
  async getRandom(@Req() req: Request): Promise<Music> {
    const musics = await this.#findMusics(req);

    assertIsNotEmpty(musics);
    const picked = await this.#randomPick(musics);

    return picked;
  }

  async #getLastMusicInHistory(): Promise<MusicEntity | null> {
    const lastOneEntry = await this.musicHistoryRepo.getLast();

    if (!lastOneEntry)
      return null;

    const lastOne = await this.musicRepo.getOneById(lastOneEntry.resourceId);

    return lastOne;
  }

  async #randomPick(musics: MusicEntity[], n: number = 1): Promise<MusicEntity> {
    const lastOne = await this.#getLastMusicInHistory() ?? undefined;
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
