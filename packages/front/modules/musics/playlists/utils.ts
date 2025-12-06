import { PATH_ROUTES } from "$shared/routing";
import { logger } from "#modules/core/logger";
import { frontendUrl } from "#modules/requests";
import { secsToMmss, pad2 } from "#modules/utils/dates";

export const formatDurationHeader = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);

  if (hours > 0) {
    const minutes = Math.round(seconds / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}:${pad2(remainingMinutes)} horas`;
  }

  const mins = Math.round(seconds / 60);

  if (mins === 1)
    return `${mins} min`;

  return `${mins} mins`;
};

export const formatDurationItem = (seconds: number): string => {
  return secsToMmss(seconds);
};

type PlaylistCopyUrlProps = {
  playlistSlug: string;
  userSlug: string;
  token?: string;
};
export async function playlistCopySlugUrl(
  { playlistSlug, userSlug, token }: PlaylistCopyUrlProps,
) {
  await navigator.clipboard.writeText(
    frontendUrl(
      PATH_ROUTES.musics.frontend.playlists.slug.withParams( {
        playlistSlug,
        userSlug,
        token,
      } ),
    ),
  );
  logger.info("Copiada url");
}
