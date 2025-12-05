import { UpdateFavButtons } from "#modules/musics/playlists/FavButton";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { MusicHistoryApi } from "../requests";
import { Body } from "./body/Body";
import { Header, OnClickMenu } from "./Header";

type Props<T> = {
  value: T;
  setValue: (newData: T)=> void;
  showDate?: boolean;
  onClickMenu?: OnClickMenu;
  updateFavButtons: UpdateFavButtons;
};
export function HistoryEntryElement(
  { value: entry,
    setValue,
    onClickMenu,
    updateFavButtons }: Props<MusicHistoryApi.GetManyByCriteria.Data>,
) {
  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry,
          onClickMenu,
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
