import path from "node:path";
import NodeID3 from "node-id3";
import { Injectable } from "@nestjs/common";
import { ARTIST_EMPTY, assertIsMusic, Music } from "../models";
import { getFullPath } from "../utils";
import { AUDIO_EXTENSIONS } from "../files";
import { MusicUrlGeneratorService } from "./url-generator.service";

@Injectable()
export class MusicBuilderService {
  private doc: Partial<Music> = {};

  constructor(
    private readonly musicUrlGenerator: MusicUrlGeneratorService,
  ) {}

  withPartial(partial: Partial<Music>) {
    Object.assign(this.doc, partial);

    return this;
  }

  async build(relativePath: string): Promise<Music> {
    // 2. Lectura de tags ID3 si no vienen en partial
    let title: string;
    let artist: string;
    const fullPath = getFullPath(relativePath);
    const tags = NodeID3.read(fullPath) ?? {};

    title = tags.title ?? getTitleFromFilenamePath(fullPath);
    artist = tags.artist ?? ARTIST_EMPTY;
    this.doc.title ??= title;
    this.doc.artist ??= artist;
    this.doc.album ??= tags.album;

    // 3. URL generator si no está definido
    if (!this.doc.url) {
      this.doc.url = await this.musicUrlGenerator.generateAvailableUrlFrom( {
        title,
        artist,
      } );
    }

    // 4. Timestamps
    const now = new Date();

    this.doc.timestamps ??= {
      createdAt: now,
      updatedAt: now,
      addedAt: now,
    };

    // 5. Peso inicial si no existe
    this.doc.weight ??= 0;

    assertIsMusic(this.doc);

    return this.doc;
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
