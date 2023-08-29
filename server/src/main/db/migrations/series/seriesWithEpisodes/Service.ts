/* eslint-disable no-await-in-loop */
import { FileNode, getSerieTreeRemote } from "#actions/nginxTree";
import { StreamWithHistoryList } from "#main/db/migrations/streams/streamsWithHistoryList";
import { Episode, EpisodeRepository } from "#modules/episodes";
import { Serie, SerieId, SerieRepository } from "#modules/series";

type SerieAndEpisodes = {
  serie: Serie;
  episodes: Episode[];
};

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: SerieRepository;
};
export default class Service {
  #episodeRepository: EpisodeRepository;

  #serieRepository: SerieRepository;

  constructor( {episodeRepository, serieRepository}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
  }

  async getSerieAndEpisodesByIdOrCreateFromFiles(id: SerieId): Promise<SerieAndEpisodes | null> {
    let serie = await this.#serieRepository.getOneById(id);
    let episodes: Episode[] | null = null;

    if (!serie) {
      const serieAndEpisodes = await this.createFromFiles(id);

      if (!serieAndEpisodes)
        return null;

      serie = serieAndEpisodes.serie;
      episodes = serieAndEpisodes.episodes;
    }

    if (!episodes)
      episodes = await this.#episodeRepository.getManyBySerieId(serie.id);

    return {
      serie,
      episodes,
    };
  }

  private async createFromFiles(id: SerieId): Promise<SerieAndEpisodes | null> {
    const { MEDIA_PATH } = process.env;
    const folder = `${MEDIA_PATH}/series/${id}`;
    const episodes: Episode[] | null = await getSerieTree(folder);

    if (!episodes)
      return null;

    return {
      serie: {
        id,
        name: id,
      },
      episodes,
    };
  }

  async findLastEpisodeInStreamWithHistoryList(streamWithHistoryList: StreamWithHistoryList): Promise<Episode | null> {
    const episodeId = streamWithHistoryList.history.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    const serieId = streamWithHistoryList.group.split("/").at(-1);

    if (!serieId)
      return null;

    const serie = await this.#serieRepository.getOneById(serieId);

    if (!serie)
      return null;

    return this.#episodeRepository.getOneById( {
      episodeId,
      serieId: serie.id,
    } );
  }
}

async function getSerieTree(uri: string): Promise<Episode[] | null> {
  if (uri.startsWith("http")) {
    const nginxTree = await getSerieTreeRemote(uri, {
      maxLevel: 2,
    } );

    if (!nginxTree)
      return null;

    return getEpisodesFromTree(nginxTree);
  }

  return getSerieTreeLocal(uri);
}

async function getEpisodesFromTree(tree: FileNode[], episodes: Episode[] = []): Promise<Episode[]> {
  for (const fn of tree) {
    if (fn.type !== "[VID]" && fn.type !== "[DIR]")
      // eslint-disable-next-line no-continue
      continue;

    if (fn.type !== "[DIR]") {
      const episode = await fileNode2Episode(fn);

      episodes.push(episode);
    }

    const {children} = fn;

    if (children)
      await getEpisodesFromTree(children, episodes);
  }

  return episodes;
}

async function fileNode2Episode(fn: FileNode): Promise<Episode> {
  const path = getPathFromFn(fn);
  const id = getIdFromFn(fn);
  const ret: Episode = {
    episodeId: id,
    serieId: "",
    path,
    title: "",
    weight: 0,
    start: -1,
    end: -1,
  };

  return ret;
}

function getIdFromFn(fn: FileNode): string {
  const season = fn.relativeUri.substr(0, fn.relativeUri.lastIndexOf("/")).split("/");
  const nameWithoutExt = fn.name.substr(0, fn.name.lastIndexOf("."));
  let id = season.join("x");

  if (season.length > 0 && season[0] !== undefined)
    id += "x";

  if (!Number.isNaN(nameWithoutExt))
    id += nameWithoutExt.padStart(2, "0");
  else
    id += nameWithoutExt;

  return id;
}

function getPathFromFn(fn: FileNode): string {
  const serieUrl = fn.uri.substr(0, fn.uri.indexOf(fn.relativeUri) - 1);
  const serieId = serieUrl.split("/").pop();

  return `series/${serieId}/${fn.relativeUri}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getSerieTreeLocal(path: string): Promise<Episode[]> {
  // fs.readdirSync(folder);
  return [];
}