// front/modules/utils/server-metadata-fetch.ts
// Utilidad para obtener datos del backend en server components (generateMetadata).
// No usa Zustand ni React hooks — sólo fetch nativo.
import { SeriesEntity } from "$shared/models/episodes/series";
import { EpisodeEntity } from "$shared/models/episodes";
import { MusicEntity } from "$shared/models/musics";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";

function toAbsoluteUrl(path: string): string {
  return `${backendUrl(path)}`;
}

// ---------------------------------------------------------------------------
// Music
// ---------------------------------------------------------------------------
export async function fetchMusicForMetadata(musicId: string): Promise<MusicEntity | null> {
  try {
    const res = await fetch(toAbsoluteUrl(PATH_ROUTES.musics.getOne.path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify( {
        filter: {
          id: musicId,
        },
        expand: ["imageCover"],
      } ),
      next: {
        revalidate: 60,
      },
    } );

    if (!res.ok)
      return null;

    const json = await res.json();

    return json.data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Playlist
// ---------------------------------------------------------------------------
type PlaylistFilter =
  | { id: string }
  | { slug: string;
ownerUserSlug: string; };

export async function fetchPlaylistForMetadata(
  filter: PlaylistFilter,
): Promise<MusicPlaylistEntity | null> {
  try {
    const res = await fetch(toAbsoluteUrl(PATH_ROUTES.musics.playlists.getOne.path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify( {
        filter,
        expand: ["imageCover"],
      } ),
      next: {
        revalidate: 60,
      },
    } );

    if (!res.ok)
      return null;

    const json = await res.json();

    return json.data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------
export async function fetchSeriesForMetadata(seriesId: string): Promise<SeriesEntity | null> {
  try {
    const res = await fetch(toAbsoluteUrl(PATH_ROUTES.episodes.series.getMany.path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify( {
        filter: {
          id: seriesId,
        },
        expand: ["countEpisodes", "countSeasons", "imageCover"],
        limit: 1,
      } ),
      next: {
        revalidate: 60,
      },
    } );

    if (!res.ok)
      return null;

    const json = await res.json();

    return json.data?.[0] ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Episode
// ---------------------------------------------------------------------------
export async function fetchEpisodeForMetadata(episodeId: string): Promise<EpisodeEntity | null> {
  try {
    const res = await fetch(toAbsoluteUrl(PATH_ROUTES.episodes.getMany.path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify( {
        filter: {
          id: episodeId,
        },
        expand: ["imageCover", "series", "seriesImageCover"],
        limit: 1,
      } ),
      next: {
        revalidate: 60,
      },
    } );

    if (!res.ok)
      return null;

    const json = await res.json();

    return json.data?.[0] ?? null;
  } catch {
    return null;
  }
}
