import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { ShareContextMenuItem } from "#modules/resources/share/ShareLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";
import { SeriesEntity } from "../models";
import { seriesIdInfoElement } from "../utils";

export const ShareSeriesContextMenuItemCurrentCtx = () => {
  const { data } = useLocalData<SeriesEntity>();

  return (
    <ShareContextMenuItem
      topNode={seriesIdInfoElement(data)}
      buildUrl={() => {
        assertIsDefined(data);

        return frontendUrl(
          PATH_ROUTES.episodes.frontend.lists.withParams( {
            serieId: data.id,
          } ),
        );
      }}
    />
  );
};
