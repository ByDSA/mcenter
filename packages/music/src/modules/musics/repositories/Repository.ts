import NodeID3 from "node-id3";
import path from "path";
import { getFullPath } from "../../../env";
import { calcHashFromFile } from "../../../files";
import { AUDIO_EXTENSIONS } from "../../../files/files.music";
import { download } from "../../../youtube";
import { DocOdm, ModelOdm } from "./odm";

export default class Repository {
  async findByHash(hash: string): Promise<DocOdm | null> {
    const music: DocOdm | null = await ModelOdm.findOne( {
      hash,
    } );

    return music;
  }

  async findByUrl(url: string): Promise<DocOdm | null> {
    const music: DocOdm | null = await ModelOdm.findOne( {
      url,
    } );

    return music;
  }

  async findAll(): Promise<Array<DocOdm>> {
    const ret = await ModelOdm.find( {
    } );

    return ret;
  }

  async findByPath(relativePath: string): Promise<DocOdm | null> {
    const music = await ModelOdm.findOne( {
      path: relativePath,
    } );

    return music;
  }

  async createFromPath(relativePath: string): Promise<DocOdm> {
    const fullPath = getFullPath(relativePath);
    const tags = NodeID3.read(fullPath);
    const title = tags.title || getTitleFromFilename(fullPath);
    let baseName = path.basename(fullPath);

    baseName = baseName.substr(0, baseName.lastIndexOf("."));
    const url = getUrl(baseName);
    const hash = calcHashFromFile(fullPath);

    return ModelOdm.create( {
      hash,
      path: relativePath,
      title,
      artist: tags.artist,
      album: tags.album,
      addedAt: Date.now(),
      url,
    } );
  }

  async createFromPathAndSave(relativePath: string): Promise<DocOdm> {
    return this.createFromPath(relativePath)
      .then((music) => music.save());
  }

  async findOrCreateAndSaveFromPath(relativePath: string): Promise<DocOdm> {
    const read = await this.findByPath(relativePath);

    if (read)
      return read;

    return this.createFromPathAndSave(relativePath);
  }

  async findOrCreateAndSaveFromYoutube(strId: string): Promise<DocOdm> {
    const data = await download(strId);

    return this.findOrCreateAndSaveFromPath(data.file);
  }

  async deleteAll() {
    await ModelOdm.deleteMany();
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

export function generateView(musics: DocOdm[]): string {
  let ret = "<ul>";

  musics.map((m) => `<li><a href='/raw/${m.url}'>${m.title}</li>`)
    .forEach((line) => { ret += line; } );
  ret += "</ul>";

  return ret;
}