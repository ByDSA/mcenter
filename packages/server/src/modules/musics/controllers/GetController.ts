/* eslint-disable import/no-internal-modules */
import { ResourcePickerRandom } from "#modules/picker";
import { SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";
import path from "node:path";
import { HistoryRepository, createHistoryEntryByMusicId } from "../history";
import { Model as Music } from "../models";
import { Repository } from "../repositories";
import { requestToFindMusicParams } from "../repositories/queries/Queries";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "../services";
import { ENVS, getFullPath } from "../utils";

function getRootUrlFromForwardedRequest(req: Request) {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const hostname = req.get("host") ?? req.get("x-forwarded-host") ?? req.hostname;
  const portStr = req.get("x-forwarded-port");
  let ret = `${protocol }://`;

  ret += hostname;

  if (portStr && ((protocol === "http" && +portStr !== 80) || (protocol === "https" && +portStr !== 443)))
    ret += `:${portStr}`;

  return ret;
}

function getRootUrlFromRequest(req: Request) {
  const isForwarded = req.get("x-forwarded-host") !== undefined;

  if (isForwarded)
    return getRootUrlFromForwardedRequest(req);

  return `${req.protocol}://${req.get("host")}`;
}

const DepsMap = {
  musicRepository: Repository,
  historyMusicRepository: HistoryRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class GetController {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getRandom(req: Request, res: Response) {
    const musics = await this.#findMusics(req);
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

  async getPlaylist(req: Request, res: Response) {
    const {name} = req.params;
    const playlistsFolder = path.join(ENVS.mediaPath, "music", "playlists");
    const filePath = path.join(playlistsFolder, name);

    res.download(filePath, (error) => {
      if (error)
        res.sendStatus(404);
    } );
  }

  async #findMusics(req: Request): Promise<Music[]> {
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
    const music = await this.#deps.musicRepository.findByUrl(name);

    if (!music) {
      res.sendStatus(404);

      return;
    }

    // History
    const entry = createHistoryEntryByMusicId(music.id);

    await this.#deps.historyMusicRepository.createOne(entry);

    // Download
    const relativePath = music.path;
    const fullpath = getFullPath(relativePath);

    res.download(fullpath, (error) => {
      if (error)
        res.sendStatus(404);
    } );
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
function generatePlaylist( {picked, nextUrl, server}: GenPlayListParams): string {
  const ROUTE_RAW = "/api/musics/get/raw";
  const ret = `#EXTM3U
  #EXTINF:317,${picked.title}
  ${server}${ROUTE_RAW}/${picked.url}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}