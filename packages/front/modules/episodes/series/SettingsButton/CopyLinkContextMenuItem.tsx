import { SeriesEntity } from "$shared/models/episodes/series";
import { PATH_ROUTES } from "$shared/routing";
import { CopyLinkContextMenuItem } from "#modules/musics/lists/CopyLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";

export const CopySeriesLinkContextMenuItem = () => {
  const { data } = useLocalData<SeriesEntity>();

  return (
    <CopyLinkContextMenuItem
      txt={() => {
        return frontendUrl(PATH_ROUTES.episodes.frontend.lists.withParams( {
          serieId: data.id,
        } ));
      }}
    />
  );
};
