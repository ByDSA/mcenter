import path from "node:path";
import { Request, Response, Router } from "express";
import { assertIsNotEmpty } from "#shared/utils/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { SecureRouter } from "#utils/express";
import { Music } from "#musics/models";
import { createMusicHistoryEntryById } from "#musics/history/models";
import { ResourcePickerRandom } from "#modules/picker";
import { MusicHistoryRepository } from "../history";
import { MusicRepository } from "../repositories";
import { requestToFindMusicParams } from "../repositories/queries/Queries";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "../services";
import { ENVS, getFullPath } from "../utils";

function getRootUrlFromForwardedRequest(req: Request): string {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const hostname = req.get("host") ?? req.get("x-forwarded-host") ?? req.hostname;
  const portStr = req.get("x-forwarded-port");
  let ret = `${protocol }://`;

  ret += hostname;

  if (portStr && ((protocol === "http" && +portStr !== 80) || (protocol === "https" && +portStr !== 443)))
    ret += `:${portStr}`;

  return ret;
}

function getRootUrlFromRequest(req: Request): string {
  const isForwarded = req.get("x-forwarded-host") !== undefined;

  if (isForwarded)
    return getRootUrlFromForwardedRequest(req);

  return `${req.protocol}://${req.get("host")}`;
}

const DEPS_MAP = {
  musicRepository: MusicRepository,
  historyMusicRepository: MusicHistoryRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicGetController {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getRandom(req: Request, res: Response): Promise<void> {
    const musics = await this.#findMusics(req);

    assertIsNotEmpty(musics);
    const picked = await this.#randomPick(musics);
    const nextRootUrl = getRootUrlFromRequest(req);
    const nextUrl = `${nextRootUrl}/${path.join("api/musics/get", req.url)}`;
    const ret = generatePlaylist( {
      picked,
      nextUrl,
      server: nextRootUrl,
    } );

    res.send(ret);
  }

  async #getLastMusicInHistory(): Promise<Music | null> {
    const lastOneEntry = await this.#deps.historyMusicRepository.getLast();

    if (!lastOneEntry)
      return null;

    const lastOne = await this.#deps.musicRepository.getOneById(lastOneEntry.resourceId);

    return lastOne;
  }

  async #randomPick(musics: Music[]): Promise<Music> {
    const lastOne = await this.#getLastMusicInHistory() ?? undefined;
    const picker = new ResourcePickerRandom<Music>( {
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

  async getAll(req: Request, res: Response) {
    const musics = await this.#findMusics(req);

    this.#sortMusics(musics);
    res.send(musics);
  }

  getPlaylist(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const playlistsFolder = path.join(ENVS.mediaPath, "music", "playlists");
    const filePath = path.join(playlistsFolder, name);

    download(res, filePath);

    return Promise.resolve();
  }

  #findMusics(req: Request): Promise<Music[]> {
    const params = requestToFindMusicParams(req);

    if (params)
      return this.#deps.musicRepository.find(params);

    return this.#deps.musicRepository.findAll();
  }

  #sortMusics(musics: Music[]): Music[] {
    return musics.sort((a: Music, b: Music) => {
      if (!a.artist || !b.artist || a.artist === b.artist)
        return a.title.localeCompare(b.title);

      return a.artist.localeCompare(b.artist);
    } );
  }

  async rawAccess(req: Request, res: Response) {
    const { name } = req.params;
    // find in DB
    const music = await this.#deps.musicRepository.findOneByUrl(name);

    if (!music) {
      res.sendStatus(404);

      return;
    }

    // History
    const entry = createMusicHistoryEntryById(music.id);

    await this.#deps.historyMusicRepository.createOne(entry);

    // Download
    const relativePath = music.path;
    const fullpath = getFullPath(relativePath);

    download(res, fullpath);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/random", this.getRandom.bind(this));
    router.get("/all", this.getAll.bind(this));
    router.get("/raw/:name", this.rawAccess.bind(this));
    router.get("/playlist/:name", this.getPlaylist.bind(this));

    return router;
  }
}

type GenPlayListParams = {
  picked: Music;
  nextUrl: string;
  server: string;
};
function generatePlaylist( { picked, nextUrl, server }: GenPlayListParams): string {
  const ROUTE_RAW = "/api/musics/get/raw";
  const artist = fixTxt(picked.artist);
  const title = fixTxt(picked.title);
  const ret = `#EXTM3U
  #EXTINF:317,${artist},${title}
  ${server}${ROUTE_RAW}/${picked.url}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}

function fixTxt(txt: string): string {
  return txt.replace(/,/g, "﹐");
}

function download(res: Response, fullpath: string) {
  return res.download(fullpath, (error) => {
    if (error) {
      if (!res.headersSent)
        res.sendStatus(404);
      else
        console.error(JSON.stringify(error, null, 2));
    }
  } );
}
