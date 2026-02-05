import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { CopyLinkContextMenuItem } from "#modules/musics/lists/CopyLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";
import { SeriesEntity } from "../models";

export const CopySeriesLinkContextMenuItemCurrentCtx = () => {
  const { data } = useLocalData<SeriesEntity>();

  return (
    <CopyLinkContextMenuItem
      txt={() => {
        assertIsDefined(data);

        return frontendUrl(PATH_ROUTES.episodes.frontend.lists.withParams( {
          serieId: data.id,
        } ));
      }}
    />
  );
};
