import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { MusicHistoryEntryFetching } from "../requests";
import { Body } from "./body/Body";
import { Header } from "./Header";

type Props<T> = {
  value: Required<T>;
  showDate?: boolean;
};
export function HistoryEntryElement(
  { value: entry, showDate = true }: Props<MusicHistoryEntryFetching.GetManyByCriteria.Data>,
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
          data: entry,
        } ),
      } )
    }
  </span>;
}
