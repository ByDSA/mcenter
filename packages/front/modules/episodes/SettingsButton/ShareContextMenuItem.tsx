import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { ShareContextMenuItem } from "#modules/resources/share/ShareLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { episodeIdInfoElement } from "../utils";

export const ShareEpisodeLinkContextMenuItemCurrentCtx = () => {
  const { data } = useLocalData<EpisodeEntity>();
  const { user } = useUser();

  return (
    <ShareContextMenuItem
      showAutoplay
      showIncludeToken
      topNode={episodeIdInfoElement(data)}
      buildUrl={( { autoplay, includeToken } ) => frontendUrl(
        PATH_ROUTES.episodes.frontend.lists.episode.withParams( {
          episodeId: data.id,
          autoplay,
          token: includeToken ? user?.id : undefined,
        } ),
      )
      }
    />
  );
};
