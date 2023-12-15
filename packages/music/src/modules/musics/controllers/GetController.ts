import { Music } from "#shared/models/musics";
import { Request, Response, Router } from "express";
import { newPicker } from "rand-picker";
import { ENVS, getFullPath } from "../../../env";
import { Repository } from "../repositories";

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
    const ret = generatePlaylist(picked, req.url);

    res.send(ret);
  }

  async getAll(req: Request, res: Response) {
    const musics = await this.findAllMusicsAndFilter(req);

    // const ret = generateView(musics);
    this.#sortMusics(musics);
    res.send(musics);
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
    const router = Router(); // TODO: cambiar por SecureRouter

    router.get("/random", this.getRandom.bind(this));
    router.get("/all", this.getAll.bind(this));
    router.get("/raw/:name", this.rawAccess.bind(this));

    return router;
  }
}

function randomPick(musics: Music[]): Music {
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
  const ROUTE_RAW = "/api/get/raw";
  const ret = `#EXTM3U
  #EXTINF:317,${picked.title}
  ${ENVS.server}${ROUTE_RAW}/${picked.url}
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