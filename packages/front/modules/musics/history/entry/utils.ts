import { PropInfo, zodSchemaToReadableFormat } from "$shared/utils/validation/zod";
import { MusicFileInfo, musicFileInfoSchema } from "$shared/models/musics/file-info";
import { Music, musicSchema as schema } from "#musics/models";

export const MUSIC_PROPS = Object.entries(zodSchemaToReadableFormat<Music>(schema)).reduce(
  (acc, [k, v]) => {
    v.caption = (() => {
      switch (k) {
        case "artist":
          return "Artista:";
        case "title":
          return "Título:";
        case "weight":
          return "Peso:";
        case "tags":
          return "Tags:";
        case "url":
          return "Url:";
        case "album":
          return "Álbum:";
        case "game":
          return "Juego:";
        case "year":
          return "Año:";
        case "country":
          return "País:";
        case "todo":
          return "ToDo:";
        default:
          return `${k}:`;
      }
    } )();

    acc[k] = v;

    return acc;
  },
 {} as Record<keyof Music, PropInfo>,
);

export const MUSIC_FILE_INFO_PROPS = Object.entries(
  zodSchemaToReadableFormat<MusicFileInfo>(musicFileInfoSchema),
).reduce(
  (acc, [k, v]) => {
    v.caption = (() => {
      switch (k) {
        case "path":
          return "Path:";
        default:
          return `${k}:`;
      }
    } )();

    acc[k] = v;

    return acc;
  },
 {} as Record<keyof MusicFileInfo, PropInfo>,
);
