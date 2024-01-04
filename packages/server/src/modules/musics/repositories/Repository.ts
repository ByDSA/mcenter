import { ARTIST_EMPTY, Music, MusicVO } from "#shared/models/musics";
import { md5FileAsync } from "#utils/crypt";
import { statSync } from "fs";
import NodeID3 from "node-id3";
import path from "path";
import { AUDIO_EXTENSIONS } from "../files";
import { getFullPath } from "../utils";
import { download } from "../youtube";
// eslint-disable-next-line import/no-cycle
import UrlGenerator from "./UrlGenerator";
import { docOdmToModel } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

export type FindParams = {
  tags?: string[];
  weight?: {
    max?: number;
    min?: number;
  };
};
type FindQueryParams = {
  tags?: {
    $in: string[];
  };
  weight?: {
    $gte?: number;
    $lte?: number;
  };
};
export default class Repository {
  async findByHash(hash: string): Promise<Music | null> {
    const musicOdm: DocOdm | null = await ModelOdm.findOne( {
      hash,
    } );

    if (!musicOdm)
      return null;

    return docOdmToModel(musicOdm);
  }

  async findByUrl(url: string): Promise<Music | null> {
    const music: DocOdm | null = await ModelOdm.findOne( {
      url,
    } );

    if (!music)
      return null;

    return docOdmToModel(music);
  }

  async findAll(): Promise<Music[]> {
    const docOdms = await ModelOdm.find( {
    } );
    const ret = docOdms.map((docOdm) => docOdmToModel(docOdm));

    return ret;
  }

  async find(params: FindParams): Promise<Music[]> {
    const query = findParamsToQueryParams(params);
    const docOdms = await ModelOdm.find(query);
    const ret = docOdms.map((docOdm) => docOdmToModel(docOdm));

    return ret;
  }

  async findByPath(relativePath: string): Promise<Music | null> {
    const docOdm = await ModelOdm.findOne( {
      path: relativePath,
    } );

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }

  async createFromPath(relativePath: string): Promise<Music> {
    const fullPath = getFullPath(relativePath);
    const id3Tags = NodeID3.read(fullPath);
    const title = id3Tags.title ?? getTitleFromFilenamePath(fullPath);
    const artist = id3Tags.artist ?? ARTIST_EMPTY;
    const urlGenerator = new UrlGenerator( {
      musicRepository: this,
    } );
    const urlPromise = urlGenerator.generateAvailableUrlFrom( {
      title,
      artist,
    } );
    const hash = await md5FileAsync(fullPath);
    const {size, mtime, ctime} = statSync(fullPath);
    const newDocOdm = {
      hash,
      size,
      path: relativePath,
      title,
      artist,
      album: id3Tags.album,
      weight: 0,
      timestamps: {
        createdAt: ctime,
        updatedAt: mtime,
      },
      mediaInfo: {
        duration: null,
      },
      url: await urlPromise,
    };
    const docOdm: DocOdm = await ModelOdm.create<MusicVO>(newDocOdm);

    return docOdmToModel(docOdm);
  }

  async updateHashOf(music: Music) {
    const hash = await md5FileAsync(getFullPath(music.path));

    await this.updateOneByPath(music.path, {
      ...music,
      hash,
    } );

    return hash;
  }

  async findOrCreateFromPath(relativePath: string): Promise<Music> {
    const read = await this.findByPath(relativePath);

    if (read)
      return read;

    return this.createFromPath(relativePath);
  }

  async findOrCreateFromYoutube(strId: string): Promise<Music> {
    const data = await download(strId);

    return this.findOrCreateFromPath(data.file);
  }

  async deleteAll() {
    await ModelOdm.deleteMany();
  }

  async deleteOneByPath(relativePath: string) {
    await ModelOdm.deleteOne( {
      path: relativePath,
    } );
  }

  async updateOneByUrl(url: string, data: Partial<Music>): Promise<void> {
    await ModelOdm.updateOne( {
      url,
    }, data);
  }

  async updateOneByHash(hash: string, data: Partial<Music>): Promise<void> {
    await ModelOdm.updateOne( {
      hash,
    }, data);
  }

  async updateOneByPath(relativePath: string, data: Partial<Music>): Promise<void> {
    await ModelOdm.updateOne( {
      path: relativePath,
    }, data);
  }
}

function getTitleFromFilenamePath(relativePath: string): string {
  let title = path.basename(relativePath);

  title = removeExtension(title);

  return fixTitle(title);
}

function removeExtension(str: string): string {
  for (const ext of AUDIO_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substr(0, index);
  }

  return str;
}

function fixTitle(title: string): string {
  return title.replace(/ \((Official )?(Lyric|Music) Video\)/ig,"")
    .replace(/\(videoclip\)/ig,"")
    .replace(/ $/g,"");
}

function findParamsToQueryParams(params: FindParams): FindQueryParams {
  const queryParams: FindQueryParams = {
  };

  if (params.tags) {
    queryParams.tags = {
      $in: params.tags,
    };
  }

  if (params.weight) {
    queryParams.weight = {
    };

    if (params.weight.min !== undefined)
      queryParams.weight.$gte = params.weight.min;

    if (params.weight.max !== undefined)
      queryParams.weight.$lte = params.weight.max;
  }

  return queryParams;
}