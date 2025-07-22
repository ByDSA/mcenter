import path from "node:path";
import { createReadStream, statSync } from "node:fs";
import { Request } from "express";
import { Controller, Get, Param, Req, Res, StreamableFile } from "@nestjs/common";
import { assertIsDefined, assertIsNotEmpty } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { Response } from "express";
import mime from "mime-types";
import { MusicEntity, musicSchema } from "#musics/models";
import { createMusicHistoryEntryById } from "#musics/history/models";
import { ResourcePickerRandom } from "#modules/picker";
import { GetMany } from "#utils/nestjs/rest/Get";
import { assertFound } from "#utils/validation/found";
import { MusicHistoryRepository } from "../history";
import { MusicRepository } from "../repositories";
import { requestToFindMusicParams } from "../repositories/queries/Queries";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "../services";
import { ENVS, getFullPath } from "../utils";
import { MusicFileInfoRepository } from "../file-info/repositories/repository";

class GetRawDto extends createZodDto(z.object( {
  url: z.string(),
} ).strict()) {}

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

@Controller("/get")
export class MusicGetController {
  constructor(
    private readonly musicHistoryRepository: MusicHistoryRepository,
    private readonly musicRepository: MusicRepository,
    private readonly musicFileInfoRepo: MusicFileInfoRepository,
  ) {
  }

  @Get("/random")
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

  @GetMany("/all", musicSchema)
  async getAll(@Req() req: Request) {
    const musics = await this.#findMusics(req);

    this.#sortMusics(musics);

    return musics;
  }

  @Get("/playlist/:name")
  getPlaylist(@Param() params: any) {
    const { name } = params;
    const playlistsFolder = path.join(ENVS.mediaPath, "music", "playlists");
    const filePath = path.join(playlistsFolder, name);
    const file = createReadStream(filePath);

    return new StreamableFile(file);
  }

  #findMusics(req: Request): Promise<MusicEntity[]> {
    const params = requestToFindMusicParams(req);

    if (params)
      return this.musicRepository.find(params);

    return this.musicRepository.getAll();
  }

  #sortMusics(musics: MusicEntity[]): MusicEntity[] {
    return musics.sort((a: MusicEntity, b: MusicEntity) => {
      if (!a.artist || !b.artist || a.artist === b.artist)
        return a.title.localeCompare(b.title);

      return a.artist.localeCompare(b.artist);
    } );
  }

  @Get("/raw/:url")
  async rawAccess(
    @Param() params: GetRawDto,
     @Res( {
       passthrough: true,
     } ) res: Response,
  ) {
    const { url } = params;
    const music = await this.musicRepository.getOneByUrl(url, {
      expand: ["fileInfos"],
    } );

    assertFound(music);
    assertFound(music.fileInfos);
    const fileInfo = music.fileInfos![0];

    assertIsDefined(fileInfo);

    // History
    const entry = createMusicHistoryEntryById(music.id);

    await this.musicHistoryRepository.createOne(entry);

    // Para obtener la duración desde VLC
    const relativePath = fileInfo.path;
    const fullpath = getFullPath(relativePath);
    const stats = statSync(fullpath);
    const mimeType = mime.lookup(fullpath) || "application/octet-stream";

    // Headers mínimos necesarios
    res.set( {
      "Content-Type": mimeType,
      "Content-Length": stats.size.toString(),
      "Accept-Ranges": "bytes",
    } );

    // Download
    const file = createReadStream(fullpath);

    return new StreamableFile(file);
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
  const ret = `#EXTM3U
  #EXTINF:317,${artist},${title}
  ${server}${PATH_ROUTES.musics.raw.withParams(picked.url)}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}

function fixTxt(txt: string): string {
  return txt.replace(/,/g, "﹐");
}
