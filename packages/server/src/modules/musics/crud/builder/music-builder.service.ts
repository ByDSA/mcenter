import path from "node:path";
import { Injectable } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import NodeID3 from "node-id3";
import { removeFilenameEndUuid, removeFilenameExtension } from "#utils/files";
import { ARTIST_EMPTY, Music, musicSchema } from "../../models";
import { getAbsolutePath } from "../../utils";
import { fixTxtFields } from "../../../resources/fix-text";
import { fixSlug } from "./fix-slug";
import { generateSlug } from "./gen-slug";

type AudioTags = {
  title?: string;
  artist?: string;
  album?: string;
};

async function readAudioTags(fullPath: string): Promise<AudioTags> {
  const ext = path.extname(fullPath).toLowerCase()
    .slice(1);

  // MP3: usa NodeID3 (ID3 tags)
  if (ext === "mp3") {
    const tags = NodeID3.read(fullPath) ?? {};

    return {
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
    };
  }

  // FLAC, M4A, APE, WMA y otros: usa ffprobe (soporta Vorbis comments y demás)
  return await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(fullPath, (err, metadata) => {
      if (err) {
        reject(err);

        return;
      }

      // ffprobe puede devolver los tags en mayúsculas (Vorbis/FLAC) o minúsculas
      const tags: Record<string, string> = (metadata.format.tags as any) ?? {};
      const get = (key: string) => tags[key] ?? tags[key.toUpperCase()] ?? undefined;

      resolve( {
        title: get("title"),
        artist: get("artist"),
        album: get("album"),
      } );
    } );
  } );
}

@Injectable()
export class MusicBuilderService {
  fixFields<T extends Partial<Omit<Music, "tags">>>(model: T): T {
    const ret = fixTxtFields(model, [
      "title",
      "artist",
      "album",
    ]);

    if (ret.slug)
      ret.slug = fixSlug(ret.slug) ?? undefined;

    return ret;
  }

  async createMusicFromFile(relativePath: string, userId: string): Promise<Music> {
    const fullPath = getAbsolutePath(relativePath);
    const fileTags = await readAudioTags(fullPath);
    const title = fileTags.title ?? getTitleFromFilenamePath(fullPath);
    const artist = fileTags.artist ?? ARTIST_EMPTY;
    const now = new Date();
    let doc1: Omit<Music, "slug"> = {
      title,
      artist,
      album: fileTags.album,
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
