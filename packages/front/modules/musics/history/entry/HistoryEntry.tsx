import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { MusicHistoryApi } from "../requests";
import { Body } from "./body/Body";
import { Header } from "./Header";

type Props<T> = {
  value: Required<T>;
  setValue: (newData: T)=> void;
  showDate?: boolean;
};
export function HistoryEntryElement(
  { value: entry, setValue, showDate =
  true }: Props<MusicHistoryApi.GetManyByCriteria.Data>,
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
          setData: setValue,
        } ),
      } )
    }
  </span>;
}
