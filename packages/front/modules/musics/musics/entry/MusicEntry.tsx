import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { Data } from "../types";
import { Body } from "./body/Body";
import { Header } from "./Header";

type Props<T> = {
  value: Required<T>;
  setValue: (newData: T)=> void;
};
export function MusicEntryElement(
  { value: entry, setValue }: Props<Data>,
) {
  return <span className="history-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry,
        } ),
        bodyContent: Body( {
          data: entry,
          setData: setValue,
        } ),
      } )
    }
  </span>;
}
