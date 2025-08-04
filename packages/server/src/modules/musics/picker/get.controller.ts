import { Request } from "express";
import { Controller, Get, Req } from "@nestjs/common";
import { assertIsNotEmpty } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity } from "#musics/models";
import { ResourcePickerRandom } from "#modules/picker/resource-picker/resource-picker-random";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicRepository } from "../crud/repository";
import { requestToFindMusicParams } from "../crud/repository/queries/queries";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "./model";

function getRootUrlFromForwardedRequest(req: Request): string {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const hostname = req.get("host") ?? req.get("x-forwarded-host") ?? req.hostname;
  const portStr = req.get("x-forwarded-port");
  let ret = `${protocol }://`;

  ret += hostname;

  if (portStr
    && ((protocol === "http" && +portStr !== 80) || (protocol === "https" && +portStr !== 443)))
    ret += `:${portStr}`;

  return ret;
}

function getRootUrlFromRequest(req: Request): string {
  const isForwarded = req.get("x-forwarded-host") !== undefined;

  if (isForwarded)
    return getRootUrlFromForwardedRequest(req);

  return `${req.protocol}://${req.get("host")}`;
}

@Controller("/")
export class MusicGetRandomController {
  constructor(
    private readonly musicHistoryRepository: MusicHistoryRepository,
    private readonly musicRepository: MusicRepository,
  ) {
  }

  @Get("/")
  async getRandom(@Req() req: Request): Promise<string> {
    const musics = await this.#findMusics(req);

    assertIsNotEmpty(musics);
    const picked = await this.#randomPick(musics);
    const nextRootUrl = getRootUrlFromRequest(req);
    const nextUrl = `${nextRootUrl}${req.url}`;
    const ret = generatePlaylist( {
      picked,
      nextUrl,
      server: nextRootUrl,
    } );

    return ret;
  }

  async #getLastMusicInHistory(): Promise<MusicEntity | null> {
    const lastOneEntry = await this.musicHistoryRepository.getLast();

    if (!lastOneEntry)
      return null;

    const lastOne = await this.musicRepository.getOneById(lastOneEntry.resourceId);

    return lastOne;
  }

  async #randomPick(musics: MusicEntity[]): Promise<MusicEntity> {
    const lastOne = await this.#getLastMusicInHistory() ?? undefined;
    const picker = new ResourcePickerRandom<MusicEntity>( {
      resources: musics,
      lastOne,
      filterApplier: genMusicFilterApplier(musics, lastOne),
      weightFixerApplier: genMusicWeightFixerApplier(),
    } );
    let [picked] = await picker.pick(1);

    // default case
    if (!picked)
      [picked] = musics;

    return picked;
  }

  #findMusics(req: Request): Promise<MusicEntity[]> {
    const params = requestToFindMusicParams(req);

    if (params)
      return this.musicRepository.getManyByQuery(params);

    return this.musicRepository.getAll();
  }
}

type GenPlayListParams = {
  picked: MusicEntity;
  nextUrl: string;
  server: string;
};
function generatePlaylist( { picked, nextUrl, server }: GenPlayListParams): string {
  const artist = fixTxt(picked.artist);
  const title = fixTxt(picked.title);
  const duration = Math.round(picked.fileInfos?.[0].mediaInfo.duration ?? -1);
  const ret = `#EXTM3U
  #EXTINF:${duration},${artist},${title}
  ${server}${PATH_ROUTES.musics.raw.withParams(picked.url)}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}

function fixTxt(txt: string): string {
  return txt.replace(/,/g, "﹐");
}
