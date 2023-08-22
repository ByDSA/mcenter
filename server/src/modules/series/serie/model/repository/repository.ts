/* eslint-disable no-await-in-loop */
import { Episode } from "#modules/series/episode";
import { EpisodeDB } from "#modules/series/episode/db";
import { episodeDBToEpisode, episodeToEpisodeDB } from "#modules/series/episode/model/repository/adapters";
import { CanCreateOneAndGet, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { assertIsNotEmpty } from "#utils/validation";
import { SerieId, SerieWithEpisodes } from "..";
import { FileNode, getSerieTreeRemote } from "../../../../../actions/nginxTree";
import { SerieDB, SerieModel as SerieWithEpisodesModel } from "./serie.model";

const { MEDIA_PATH } = process.env;

export default class SerieWithEpisodesRepository
implements CanGetOneById<SerieWithEpisodes, SerieId>,
CanUpdateOneByIdAndGet<SerieWithEpisodes, SerieId>,
CanCreateOneAndGet<SerieWithEpisodes>
{
  async findOneFromGroupId(groupId: string): Promise<SerieWithEpisodes | null> {
    const groupSplit = groupId.split("/");

    assertIsNotEmpty(groupSplit);

    const serieId = groupSplit.at(-1) as string;
    const serie = await this.getOneById(serieId);

    return serie;
  }

  async createOneAndGet(serie: SerieWithEpisodes): Promise<SerieWithEpisodes> {
    const serieDB = await SerieWithEpisodesModel.create( {
      id: serie.id,
      name: serie.id,
      episodes: serie.episodes.map(episodeToEpisodeDB),
    } ).then(s => s.save());

    return {
      id: serieDB.id,
      name: serieDB.name,
      episodes: serieDB.episodes.map((episodeDB: EpisodeDB): Episode => episodeDBToEpisode(episodeDB, serieDB.id)),
    };
  }

  async getOneById(id: string): Promise<SerieWithEpisodes | null> {
    const [serieDB]: SerieDB[] = await SerieWithEpisodesModel.find( {
      id,
    }, {
      _id: 0,
    } );
    let serie: SerieWithEpisodes;

    if (!serieDB) {
      const generatedSerie = await generateFromFiles(id);

      if (!generatedSerie)
        return null;

      serie = await this.createOneAndGet(generatedSerie);
    } else {
      serie = {
        id: serieDB.id,
        name: serieDB.name,
        episodes: serieDB.episodes.map((episodeDB: EpisodeDB): Episode => episodeDBToEpisode(episodeDB, id)),
      };
    }

    return serie;
  }

  async updateOneByIdAndGet(id: SerieId, serie: SerieWithEpisodes): Promise<SerieWithEpisodes | null> {
    return SerieWithEpisodesModel.findOneAndUpdate( {
      id,
    }, serie, {
      new: true,
    } );
  }
}

async function generateFromFiles(id: SerieId): Promise<SerieWithEpisodes | null> {
  const folder = `${MEDIA_PATH}/series/${id}`;
  const episodes: Episode[] | null = await getSerieTree(folder);

  if (!episodes)
    return null;

  return {
    id,
    name: id,
    episodes,
  };
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