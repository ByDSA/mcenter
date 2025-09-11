import { Episode, episodeSchema } from "$shared/models/episodes";
import { EpisodeFileInfo, episodeFileInfoSchema } from "$shared/models/episodes/file-info";
import { schemaToProps } from "#modules/utils/schema-to-props";

export const EPISODE_PROPS = schemaToProps<Episode>(episodeSchema)( {
  title: "Título:",
  weight: "Peso:",
  tags: "Tags:",
} );

export const EPISODE_FILE_INFO_PROPS = schemaToProps<EpisodeFileInfo>(episodeFileInfoSchema)( {
  path: "Path:",
  start: "Inicio:",
  end: "Fin:",
  "mediaInfo.duration": "Duración:",
  hash: "Hash:",
  size: "Tamaño:",
} );
