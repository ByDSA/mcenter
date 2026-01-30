import { SeriesEntity } from "$shared/models/episodes/series";
import { CopyLinkContextMenuItem } from "#modules/musics/lists/CopyLinkContextMenuItem";
import { frontendUrl } from "#modules/requests";
import { useLocalData } from "#modules/utils/local-data-context";

export const CopySeriesLinkContextMenuItem = () => {
  const { data } = useLocalData<SeriesEntity>();

  return (
    <CopyLinkContextMenuItem
      txt={() => {
        return frontendUrl(`/series/series/${data.id}`);
      }}
    />
  );
};
