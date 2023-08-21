/* eslint-disable no-await-in-loop */
import { Episode } from "#modules/series/episode";
import { Repository } from "src/utils/base/repository";
import { assertHasItems } from "#modules/utils/base/http/asserts";
import { FileNode, getSerieTreeRemote } from "../../../../../actions/nginxTree";
import SerieWithEpisodes, { SerieId } from "../serie.entity";
import { SerieModel as SerieWithEpisodesModel } from "./serie.model";

const { MEDIA_PATH } = process.env;

export default class SerieRepository implements Repository {
  async findOneFromGroupId(groupId: string): Promise<SerieWithEpisodes | null> {
    const groupSplit = groupId.split("/");

    assertHasItems(groupSplit);

    const serieId = groupSplit.at(-1) as string;
    const serie = await this.findOneById(serieId);

    return serie;
  }

  async findOneById(id: string): Promise<SerieWithEpisodes | null> {
    let [serie]: SerieWithEpisodes[] = await SerieWithEpisodesModel.find( {
      id,
    }, {
      _id: 0,
    } );

    if (!serie) {
      const generatedSerie = await generateFromFiles(id);

      if (!generatedSerie)
        return null;

      serie = generatedSerie;
    }

    return serie;
  }

  async updateOneById(id: SerieId, serie: SerieWithEpisodes): Promise<SerieWithEpisodes | null> {
    return SerieWithEpisodesModel.findOneAndUpdate( {
      id,
    }, serie, {
      new: true,
    } );
  }
}

async function generateFromFiles(id: string): Promise<SerieWithEpisodes | null> {
  const folder = `${MEDIA_PATH}/series/${id}`;
  const episodes: Episode[] | null = await getSerieTree(folder);

  if (!episodes)
    return null;

  return SerieWithEpisodesModel.create( {
    id,
    name: id,
    episodes,
  } ).then(serie => serie.save());
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
    id: {
      innerId: id,
      serieId: "",
    },
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