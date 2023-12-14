import { Music } from "#shared/models/musics";
import NodeID3 from "node-id3";
import path from "path";
import { getFullPath } from "../../../env";
import { calcHashFromFile } from "../../../files";
import { AUDIO_EXTENSIONS } from "../../../files/files.music";
import { download } from "../../../youtube";
import { docOdmToModel } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

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
    const tags = NodeID3.read(fullPath);
    const title = tags.title || getTitleFromFilename(fullPath);
    let baseName = path.basename(fullPath);

    baseName = baseName.substr(0, baseName.lastIndexOf("."));
    const url = getUrl(baseName);
    const hash = calcHashFromFile(fullPath);
    const docOdm = await ModelOdm.create( {
      hash,
      path: relativePath,
      title,
      artist: tags.artist,
      album: tags.album,
      addedAt: Date.now(),
      url,
    } );

    docOdm.save();

    return docOdmToModel(docOdm);
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

function getTitleFromFilename(relativePath: string): string {
  const title = path.basename(relativePath);

  return removeExtension(title);
}

function removeExtension(str: string): string {
  for (const ext of AUDIO_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substr(0, index);
  }

  return str;
}

function getUrl(title: string) {
  const uri = title
    .toLowerCase()
    .replace(/(-\s-)|(\s-)|(-\s)/g, "-")
    .replace(/\s/g, "_")
    .replace(/&|\?|\[|\]|:|'|"/g, "");

  return uri;
}

export function generateView(musics: Music[]): string {
  let ret = "<ul>";

  musics.map((m) => `<li><a href='/raw/${m.url}'>${m.title}</li>`)
    .forEach((line) => { ret += line; } );
  ret += "</ul>";

  return ret;
}