import path from "node:path";
import NodeID3 from "node-id3";
import { Injectable } from "@nestjs/common";
import { deepCopy } from "$shared/utils/objects";
import { ARTIST_EMPTY, assertIsMusic, Music } from "../../models";
import { getAbsolutePath } from "../../utils";
import { AUDIO_EXTENSIONS } from "../../files";
import { MusicSlugGeneratorService } from "./slug-generator.service";
import { fixTxtFields } from "../../../resources/fix-text";
import { fixSlug } from "./fix-slug";

export function fixFields<T extends Partial<Music>>(model: T): T {
  const ret = fixTxtFields(model, [
    "title",
    "artist",
    "album"
  ]);

  if (ret.slug)
    ret.slug = fixSlug(ret.slug) ?? undefined;

  return ret;
}

@Injectable()
export class MusicBuilderService {
  constructor(
    private readonly musicSlugGenerator: MusicSlugGeneratorService,
  ) {
  }

  async build(relativePath: string, partial?: Partial<Music>): Promise<Music> {
    let doc: Partial<Music> = partial ? deepCopy(partial) : {};
    // 2. Lectura de tags ID3 si no vienen en partial
    let title: string;
    let artist: string;
    const fullPath = getAbsolutePath(relativePath);
    const tags = NodeID3.read(fullPath) ?? {};

    title = tags.title ?? getTitleFromFilenamePath(fullPath);
    artist = tags.artist ?? ARTIST_EMPTY;
    doc.title ??= title;
    doc.artist ??= artist;
    doc.album ??= tags.album;

    doc = fixFields(doc);

    // 3. Slug generator si no está definido
    if (!doc.slug) {
      doc.slug = await this.musicSlugGenerator.generateAvailableSlugFrom( {
        title: doc.title!,
        artist: doc.artist!,
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

  return title;
}

function removeExtension(str: string): string {
  for (const ext of AUDIO_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substr(0, index);
  }

  return str;
}
