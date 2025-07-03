import { Entry } from "#modules/musics/history/models";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { Body } from "./body/Body";
import { Header } from "./Header";

type Props<T> = {
  value: Required<T>;
  showDate?: boolean;
};
export function HistoryEntryElement(
  { value: entry, showDate = true }: Props<Entry>,
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
