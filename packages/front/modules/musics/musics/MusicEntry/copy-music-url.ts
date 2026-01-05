import { Music } from "$shared/models/musics";
import { PATH_ROUTES } from "$shared/routing";
import { frontendUrl } from "#modules/requests";

type CopyMusicProps = {
  music: Music;
  token?: string;
};
export async function copyMusicUrl( { music, token }: CopyMusicProps) {
  await navigator.clipboard.writeText(
    frontendUrl(
      PATH_ROUTES.musics.frontend.slug.withParams( {
        slug: music.slug,
        token: token,
      } ),
    ),
  );
}
