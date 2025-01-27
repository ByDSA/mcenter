import { EpisodeVO, EpisodeVOSchema as VOSchema } from "#shared/models/episodes";
import { PropInfo, zodSchemaToReadableFormat } from "#shared/utils/validation/zod";

export const EPISODE_PROPS = Object.entries(zodSchemaToReadableFormat<EpisodeVO>(VOSchema)).reduce(
  (acc, [k, v]) => {
    v.caption = (() => {
      switch (k) {
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
 {} as Record<keyof EpisodeVO, PropInfo>,
);
