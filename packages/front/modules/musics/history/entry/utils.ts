import { Music, musicSchema as VOSchema } from "#musics/models";
import { PropInfo, zodSchemaToReadableFormat } from "$shared/utils/validation/zod";

export const MUSIC_PROPS = Object.entries(zodSchemaToReadableFormat<Music>(VOSchema)).reduce(
  (acc, [k, v]) => {
    v.caption = (() => {
      switch (k) {
        case "artist":
          return "Artista:";
        case "title":
          return "Título:";
        case "weight":
          return "Peso:";
        case "path":
          return "Path:";
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
