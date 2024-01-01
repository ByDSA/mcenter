import { ResourcePickerRandom } from "#modules/picker";
import { Music } from "#shared/models/musics";
import { SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import path from "node:path";
import { Repository } from "../repositories";
import { FindParams } from "../repositories/Repository";
import { genMusicFilterApplier, genMusicWeightFixerApplier } from "../services/MusicPicker/appliers";
import { ENVS, getFullPath } from "../utils";

let lastPicked: Music | undefined;

type Params = {
  musicRepository: Repository;
};
export default class GetController {
  #musicRepository: Repository;

  constructor( {musicRepository}: Params) {
    this.#musicRepository = musicRepository;
  }

  async getRandom(req: Request, res: Response) {
    const musics = await this.#findMusics(req);
    const picked = await randomPick(musics);
    const nextUrlServer = ENVS.backendUrl;
    const nextUrl = `${nextUrlServer}/${path.join("api/musics/get", req.url)}`;
    const ret = generatePlaylist(picked, nextUrl);

    res.send(ret);
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
    const musics = await this.#musicRepository.find(params);

    return musics;
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
    const music = await this.#musicRepository.findByUrl(name);

    if (!music) {
      res.sendStatus(404);

      return;
    }

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

async function randomPick(musics: Music[]): Promise<Music> {
  const picker = new ResourcePickerRandom<Music>( {
    resources: musics,
    lastEp: lastPicked,
    filterApplier: genMusicFilterApplier(musics, lastPicked),
    weightFixerApplier: genMusicWeightFixerApplier(),
  } );
  let [picked] = await picker.pick(1);

  // default case
  if (!picked)
    [picked] = musics;

  lastPicked = picked;

  return picked;
}

function generatePlaylist(picked: Music, nextUrl: string): string {
  const ROUTE_RAW = "/api/musics/get/raw";
  const {backendUrl: server} = ENVS;
  const ret = `#EXTM3U
  #EXTINF:317,${picked.title}
  ${server}${ROUTE_RAW}/${picked.url}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}

function requestToFindMusicParams(req: Request): FindParams {
  const tagsQuery = <string | undefined>req.query.tags;
  const minWeightQuery = <string | undefined>req.query.minWeight;
  const maxWeightQuery = <string | undefined>req.query.maxWeight;
  const params: FindParams = {
  };

  if (minWeightQuery !== undefined || maxWeightQuery !== undefined){
    params.weight = {
    };

    if (minWeightQuery !== undefined)
      params.weight.min = +minWeightQuery;

    if (maxWeightQuery !== undefined)
      params.weight.max = +maxWeightQuery;
  }

  if (tagsQuery) {
    const multipleTags = tagsQuery.split(",");

    params.tags = multipleTags;
  }

  return params;
}