import { Request } from "express";
import { Controller, Get, Query, Req, UseInterceptors } from "@nestjs/common";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { Music, MusicEntity, MusicEntityWithUserInfo } from "#musics/models";
import { assertIsNotEmptyClient } from "#utils/validation/found";
import { User } from "#core/auth/users/User.decorator";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsRepository } from "../crud/repositories/music";
import { requestToFindMusicParams } from "../crud/repositories/music/queries/queries";
import { ResponseFormatInterceptor } from "../../resources/response-formatter/response-format.interceptor";
import { M3u8FormatUseNext } from "../../resources/response-formatter/use-next.decorator";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "./model";
import { MusicPickerRandom } from "./model/music-picker";

type Entity = MusicEntityWithUserInfo;

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
    @User() user: UserPayload | null,
  ): Promise<Music> {
    mongoDbId.or(z.undefined()).parse(token);
    const musics = await this.#findMusics(user?.id ?? token ?? null, req);

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
    musics: Entity[],
    n: number = 1,
  ): Promise<Entity> {
    const lastOne = (userId ? await this.#getLastMusicInHistory(userId) : undefined) ?? undefined;
    const picker = new MusicPickerRandom( {
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

  async #findMusics(userId: string | null, req: Request): Promise<MusicEntityWithUserInfo[]> {
    const params = requestToFindMusicParams(req);

    if (params) {
      return await this.musicRepo.getManyByQuery(userId, params, {
        expand: ["userInfo"],
      } ) as MusicEntityWithUserInfo[];
    }

    return (await this.musicRepo.getAll(userId, {
      expand: ["userInfo"],
    } )) as MusicEntityWithUserInfo[];
  }
}
