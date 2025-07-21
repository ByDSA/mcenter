import { Episode, episodeSchema as schema } from "$shared/models/episodes";
import { EpisodeFileInfo, episodeFileInfoSchema } from "$shared/models/episodes/file-info";
import { PropInfo, zodSchemaToReadableFormat } from "$shared/utils/validation/zod";

export const EPISODE_PROPS = Object.entries(zodSchemaToReadableFormat<Episode>(schema)).reduce(
  (acc, [k, v]) => {
    v.caption = (() => {
      switch (k) {
        case "title":
          return "Título:";
        case "weight":
          return "Peso:";
        case "tags":
          return "Tags:";
        case "url":
          return "Url:";
        default:
          return `${k}:`;
      }
    } )();

    acc[k] = v;

    return acc;
  },
 {} as Record<keyof Episode, PropInfo>,
);

export const EPISODE_FILE_INFO_PROPS = Object.entries(
  zodSchemaToReadableFormat<EpisodeFileInfo>(episodeFileInfoSchema),
).reduce(
  (acc, [k, v]) => {
    v.caption = (() => {
      switch (k) {
        case "path":
          return "Path:";
        case "start":
          return "Inicio:";
        case "end":
          return "Fin:";
        default:
          return `${k}:`;
      }
    } )();

    acc[k] = v;

    return acc;
  },
 {} as Record<keyof EpisodeFileInfo, PropInfo>,
);
