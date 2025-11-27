import { UpdateFavButtons } from "#modules/musics/playlists/FavButton";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { MusicHistoryApi } from "../requests";
import { Body } from "./body/Body";
import { Header } from "./Header";

type Props<T> = {
  value: T;
  setValue: (newData: T)=> void;
  showDate?: boolean;
  contextMenu?: ContextMenuProps;
  updateFavButtons: UpdateFavButtons;
};
export function HistoryEntryElement(
  { value: entry,
    setValue,
    contextMenu,
    updateFavButtons }: Props<MusicHistoryApi.GetManyByCriteria.Data>,
) {
  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry,
          contextMenu,
          updateFavButtons,
        } ),
        bodyContent: Body( {
          data: entry,
          setData: setValue,
        } ),
      } )
    }
  </span>;
}
