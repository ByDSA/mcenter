import { ARTIST_EMPTY, Music } from "#musics/models";
import { fixSlug } from "./fix-slug";

export function generateSlug(music: Omit<Music, "slug">): string {
  const { artist, title } = music;
  const base = !artist || artist === ARTIST_EMPTY ? title : `${artist}-${title}`;
  const ret = fixSlug(base);

  if (ret === null)
    throw new Error("Invalid slug");

  return ret;
}
