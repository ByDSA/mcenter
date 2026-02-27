import type { BreadcrumbRegistryEntry } from "./types";
import { Home } from "@mui/icons-material";
import { musicSingleBreadcrumbsEntry } from "app/musics/[musicId]/breadcrumbs";
import { musicRootBreadcrumbsEntry } from "app/musics/breadcrumbs";
import { musicHistoryBreadcrumbsEntry } from "app/musics/history/breadcrumbs";
import { musicPlaylistBreadcrumbsEntry } from "app/musics/playlists/[playlistId]/breadcrumbs";
import { musicListsBreadcrumbsEntry } from "app/musics/playlists/breadcrumbs";
import { musicSmartPlaylistBreadcrumbsEntry } from "app/musics/smart-playlists/[smartPlaylistId]/breadcrumbs";
import { playerRemoteBreadcrumbsEntry } from "app/player/remote/[id]/breadcrumbs";
import { seriesBreadcrumbsEntry, seriesRootBreadcrumbsEntry } from "app/series/breadcrumbs";
import { episodeBreadcrumbsEntry } from "app/series/episodes/[episodeId]/breadcrumbs";

export const registry: ReadonlyArray<BreadcrumbRegistryEntry> = [
  seriesRootBreadcrumbsEntry,
  seriesBreadcrumbsEntry,
  episodeBreadcrumbsEntry,
  playerRemoteBreadcrumbsEntry,
  musicRootBreadcrumbsEntry,
  musicPlaylistBreadcrumbsEntry,
  musicSmartPlaylistBreadcrumbsEntry,
  musicHistoryBreadcrumbsEntry,
  musicListsBreadcrumbsEntry,
  musicSingleBreadcrumbsEntry,
  // Home
  {
    matcher( { segment } ) {
      return segment === "/";
    },
    // eslint-disable-next-line require-await
    handler: async ( { segment } ) => {
      return {
        items: [{
          href: segment,
          icon: <Home/>,
        }],
        stopChain: true,
      };
    },
  },

  // Default
  {
    matcher() {
      return true;
    },
    // eslint-disable-next-line require-await
    handler: async ( { segment } ) => {
      const label = segment.split("/").at(-1);

      if (!label) {
        return {
          items: [],
        };
      }

      return {
        items: [
          {
            label: phraseCase(label),
            href: segment,
          },
        ],
      };
    },
  },
] as const;

function phraseCase(str: string) {
  if (!str)
    return str;

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
