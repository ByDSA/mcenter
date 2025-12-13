import { Music, MusicUserInfo, musicUserInfoSchema, musicSchema as schema } from "#musics/models";
import { schemaToProps } from "#modules/utils/schema-to-props";

export const MUSIC_PROPS = schemaToProps<Music>(schema)( {
  artist: "Artista:",
  title: "Título:",
  tags: "Tags:",
  slug: "Slug:",
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
