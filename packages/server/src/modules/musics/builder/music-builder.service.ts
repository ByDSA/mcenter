import path from "node:path";
import NodeID3 from "node-id3";
import { Injectable } from "@nestjs/common";
import { deepCopy } from "$shared/utils/objects";
import { ARTIST_EMPTY, assertIsMusic, Music } from "../models";
import { getFullPath } from "../utils";
import { AUDIO_EXTENSIONS } from "../files";
import { MusicUrlGeneratorService } from "./url-generator.service";

@Injectable()
export class MusicBuilderService {
  constructor(
    private readonly musicUrlGenerator: MusicUrlGeneratorService,
  ) {
  }

  async build(relativePath: string, partial?: Partial<Music>): Promise<Music> {
    const doc: Partial<Music> = partial ? deepCopy(partial) : {};
    // 2. Lectura de tags ID3 si no vienen en partial
    let title: string;
    let artist: string;
    const fullPath = getFullPath(relativePath);
    const tags = NodeID3.read(fullPath) ?? {};

    title = tags.title ?? getTitleFromFilenamePath(fullPath);
    artist = tags.artist ?? ARTIST_EMPTY;
    doc.title ??= title;
    doc.artist ??= artist;
    doc.album ??= tags.album;

    // 3. URL generator si no está definido
    if (!doc.url) {
      doc.url = await this.musicUrlGenerator.generateAvailableUrlFrom( {
        title,
        artist,
      } );
    }

    // 4. Timestamps
    const now = new Date();

    doc.timestamps ??= {
      createdAt: now,
      updatedAt: now,
      addedAt: now,
    };

    // 5. Peso inicial si no existe
    doc.weight ??= 0;

    assertIsMusic(doc);

    return doc;
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
  return title.replace(/ \((Official )?(Lyric|Music) Video\)/ig, "")
    .replace(/\(videoclip\)/ig, "")
    .replace(/ $/g, "");
}
