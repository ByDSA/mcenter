import { MusicFileInfo, musicFileInfoSchema } from "$shared/models/musics/file-info";
import { Music, MusicUserInfo, musicUserInfoSchema, musicSchema as schema } from "#musics/models";
import { schemaToProps } from "#modules/utils/schema-to-props";

export const MUSIC_PROPS = schemaToProps<Music>(schema)( {
  artist: "Artista:",
  title: "Título:",
  tags: "Tags:",
  slug: "Url:",
  album: "Álbum:",
  game: "Juego:",
  year: "Año:",
  country: "País:",
  "timestamps.addedAt": "Añadido:",
  "timestamps.createdAt": "Creación:",
  "timestamps.releasedOn": "Lanzada:",
  "timestamps.updatedAt": "Última modificación:",
  disabled: "Desactivado:",
  spotifyId: "Spotify ID:",
} );

export const MUSIC_USER_INFO_PROPS = schemaToProps<MusicUserInfo>(musicUserInfoSchema)( {
  weight: "Peso:",
  lastTimePlayed: "Última reproducción:",
} );

export const MUSIC_FILE_INFO_PROPS = schemaToProps<MusicFileInfo>(musicFileInfoSchema)( {
  path: "Path:",
  hash: "Hash:",
  "timestamps.createdAt": "Creación:",
  "timestamps.updatedAt": "Modificación:",
  size: "Tamaño:",
  "mediaInfo.duration": "Duración:",
  musicId: "ID Música:",
} as const);
