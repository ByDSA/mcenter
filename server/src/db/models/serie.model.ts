/* eslint-disable require-await */
/* eslint-disable no-await-in-loop */
import dotenv from "dotenv";
import mongoose, { Document, Schema } from "mongoose";
import { FileNode, getSerieTreeRemote } from "../../actions/nginxTree";
import { Episode, EpisodeSchema } from "./episode";

dotenv.config();

const { MEDIA_PATH } = process.env;

interface Serie extends Document {
    id: string;
    name: string;
    episodes: Episode[];
}

const NAME = "Serie";
const schema = new Schema( {
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  episodes: {
    type: [EpisodeSchema],
  },
} );
const model = mongoose.model<Serie>(NAME, schema);

export async function getFromGroupId(groupId: string): Promise<Serie | null> {
  const groupSplit = groupId.split("/");
  const serieId = groupSplit[groupSplit.length - 1];
  const serie = await getById(serieId);

  return serie;
}

export async function getById(id: string): Promise<Serie | null> {
  let [serie]: Serie[] = await model.find( {
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

export async function generateFromFiles(id: string): Promise<Serie | null> {
  const folder = `${MEDIA_PATH}/series/${id}`;
  const episodes: Episode[] | null = await getSerieTree(folder);

  if (!episodes)
    return null;

  return model.create( {
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

  return {
    id,
    path,
    title: "",
    weight: 0,
    start: -1,
    end: -1,
  };
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

export {
  schema as SerieSchema, model as SerieModel, Serie,
};
