import { ResourcePickerRandom } from "#modules/picker";
import { Music } from "#shared/models/musics";
import { SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import path from "node:path";
import { newPicker } from "rand-picker";
import { Repository } from "../repositories";
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
    const musics = await this.findAllMusicsAndFilter(req);
    const picked = randomPick(musics);
    const nextUrlServer = ENVS.backendUrl;
    const nextUrl = `${nextUrlServer}/${path.join("api/musics/get", req.url)}`;
    const ret = generatePlaylist(picked, nextUrl);

    res.send(ret);
  }

  async getAll(req: Request, res: Response) {
    const musics = await this.findAllMusicsAndFilter(req);

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

  async findAllMusicsAndFilter(req: Request): Promise<Music[]> {
    let musics = await this.#musicRepository.findAll();
    const tagsQuery = <string | undefined>req.query.tags;
    const minWeightQuery = <string | undefined>req.query.minWeight;
    const maxWeightQuery = <string | undefined>req.query.maxWeight;

    if (minWeightQuery !== undefined) {
      const minWeight = parseInt(minWeightQuery, 10);

      musics = musics.filter((m) => (m.weight || 0) >= minWeight);
    }

    if (maxWeightQuery !== undefined) {
      const maxWeight = parseInt(maxWeightQuery, 10);

      musics = musics.filter((m) => (m.weight || 0) <= maxWeight);
    }

    if (tagsQuery) {
      const multipleTags = tagsQuery.split(",");

      for (const tag of multipleTags)
        musics = musics.filter((m) => m.tags?.includes(tag));
    }

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

function randomPick(musics: Music[]): Music {
  const nPicker = new ResourcePickerRandom<Music>( {
    resources: musics,
    lastEp: lastPicked,
    filterApplier: genMusicFilterApplier(episodes, lastEp),
    weightFixerApplier: genMusicWeightFixerApplier(),
  } );
  const picker = newPicker(musics, {
    weighted: true,
    randomMode: 0,
  } );

  for (const m of musics) {
    const initialWeight = m.weight || 0;
    let finalWeight = getFinalWeight(initialWeight);

    if (initialWeight <= -99)
      finalWeight = 0;

    if (m.url === lastPicked?.url)
      finalWeight = 0;

    picker.put(m, finalWeight);
  }

  if (lastPicked) {
    if (picker.length === 1)
      return lastPicked;
  }

  let picked = picker.pickOne();

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

function getFinalWeight(value: number): number {
  if (value >= -1 && value <= 1)
    return 1;

  if (value < 0)
    return 1 / -value;

  return value;
}