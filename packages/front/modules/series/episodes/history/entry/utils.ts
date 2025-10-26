import { Episode, episodeSchema, EpisodeUserInfo, episodeUserInfoSchema } from "$shared/models/episodes";
import { EpisodeFileInfo, episodeFileInfoSchema } from "$shared/models/episodes/file-info";
import { schemaToProps } from "#modules/utils/schema-to-props";

export const EPISODE_PROPS = schemaToProps<Episode>(episodeSchema)( {
  title: "Título:",
  tags: "Tags:",
} );

export const EPISODE_USER_INFO_PROPS = schemaToProps<EpisodeUserInfo>(episodeUserInfoSchema)( {
  weight: "Peso:",
} );

export const EPISODE_FILE_INFO_PROPS = schemaToProps<EpisodeFileInfo>(episodeFileInfoSchema)( {
  path: "Path:",
  start: "Inicio:",
  end: "Fin:",
  "mediaInfo.duration": "Duración:",
  hash: "Hash:",
  size: "Tamaño:",
} );
