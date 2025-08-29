import { MusicFileInfo, musicFileInfoSchema } from "$shared/models/musics/file-info";
import { Music, musicSchema as schema } from "#musics/models";
import { schemaToProps } from "#modules/utils/schema-to-props";

export const MUSIC_PROPS = schemaToProps<Music>(schema, {
  artist: "Artista:",
  title: "Título:",
  weight: "Peso:",
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
  lastTimePlayed: "Última reproducción:",
  "timestamps.undefined": "", // TODO: ??
} );

export const MUSIC_FILE_INFO_PROPS = schemaToProps<MusicFileInfo>(musicFileInfoSchema, {
  path: "Path:",
  hash: "Hash:",
  "timestamps.createdAt": "Creación:",
  "timestamps.updatedAt": "Última modificación:",
  size: "Tamaño:",
  "mediaInfo.duration": "Duración:",
  musicId: "ID Música:",
} as const);
