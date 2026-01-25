import path from "node:path";
import { Injectable } from "@nestjs/common";
import NodeID3 from "node-id3";
import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { ARTIST_EMPTY, Music, musicSchema } from "../../models";
import { getAbsolutePath } from "../../utils";
import { fixTxtFields } from "../../../resources/fix-text";
import { fixSlug } from "./fix-slug";
import { generateSlug } from "./gen-slug";

@Injectable()
export class MusicBuilderService {
  fixFields<T extends Partial<Music>>(model: T): T {
    const ret = fixTxtFields(model, [
      "title",
      "artist",
      "album",
    ]);

    if (ret.slug)
      ret.slug = fixSlug(ret.slug) ?? undefined;

    return ret;
  }

  // eslint-disable-next-line require-await
  async createMusicFromFile(relativePath: string, userId: string): Promise<Music> {
    let title: string;
    let artist: string;
    const fullPath = getAbsolutePath(relativePath);
    const tags = NodeID3.read(fullPath) ?? {};

    title = tags.title ?? getTitleFromFilenamePath(fullPath);
    artist = tags.artist ?? ARTIST_EMPTY;

    const now = new Date();
    let doc1: Omit<Music, "slug"> = {
      title,
      artist,
      album: tags.album,
      uploaderUserId: userId,
      createdAt: now,
      updatedAt: now,
      addedAt: now,
    };
    let doc = {
      ...doc1,
      slug: generateSlug(doc1),
    };

    doc = this.fixFields(doc);

    musicSchema.parse(doc);

    return doc;
  }
}

function getTitleFromFilenamePath(relativePath: string): string {
  let title = path.basename(relativePath);
  let oldTitle: string;

  do {
    oldTitle = title;
    title = removeFilenameExtension(title);
    title = removeFilenameEndUuid(title);
  } while (oldTitle !== title);

  return title;
}

function removeFilenameEndUuid(str: string): string {
  const uuidRegex = /\[[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\]$/;

  return str.replace(uuidRegex, "");
}
export function removeFilenameExtension(str: string): string {
  for (const ext of AUDIO_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substring(0, index);
  }

  return str;
}
