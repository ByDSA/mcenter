import { Body } from "./body/Body";
import { Header } from "./Header";
import { MusicHistoryEntry } from "#modules/musics/history/models";
import { ResourceAccordion } from "#modules/ui-kit/accordion";

type Props<T> = {
  value: Required<T>;
  showDate?: boolean;
};
export function HistoryEntryElement(
  { value: entry, showDate = true }: Props<MusicHistoryEntry>,
) {
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
