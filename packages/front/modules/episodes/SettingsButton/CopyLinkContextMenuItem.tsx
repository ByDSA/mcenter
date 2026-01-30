import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { CopyLinkContextMenuItem } from "#modules/musics/lists/CopyLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";

export const CopyEpisodeLinkContextMenuItem = () => {
  const { data } = useLocalData<EpisodeEntity>();

  return (
    <CopyLinkContextMenuItem
      txt={() => {
        return frontendUrl(
          PATH_ROUTES.episodes.slug.withParams(
            data.compKey.seriesKey,
            data.compKey.episodeKey,
          ),
        );
      }}
    />
  );
};
