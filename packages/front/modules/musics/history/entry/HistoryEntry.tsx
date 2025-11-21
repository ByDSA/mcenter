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
};
export function HistoryEntryElement(
  { value: entry, setValue, contextMenu }: Props<MusicHistoryApi.GetManyByCriteria.Data>,
) {
  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry,
          contextMenu,
        } ),
        bodyContent: Body( {
          data: entry,
          setData: setValue,
        } ),
      } )
    }
  </span>;
}
