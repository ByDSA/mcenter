
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { HistoryMusicEntry } from "#shared/models/musics";
import Body from "./body/Body";
import Header from "./Header";

type Props<T> = {
  value: Required<T>;
  showDate?: boolean;
};
export default function HistoryEntryElement( {value: entry, showDate = true}: Props<HistoryMusicEntry>) {
  return <span className="history-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry,
          showDate,
        } ),
        bodyContent: Body( {
          entry,
        } ),
      } )
    }
  </span>;
}
