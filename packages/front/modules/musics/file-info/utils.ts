import { MusicFileInfo, musicFileInfoSchema } from "$shared/models/musics/file-info";
import { schemaToProps } from "#modules/utils/schema-to-props";

export const MUSIC_FILE_INFO_PROPS = schemaToProps<MusicFileInfo>(musicFileInfoSchema)( {
  path: "Path:",
  hash: "Hash:",
  "timestamps.createdAt": "Creación:",
  "timestamps.updatedAt": "Modificación:",
  size: "Tamaño:",
  "mediaInfo.duration": "Duración:",
  musicId: "ID Música:",
} as const);
