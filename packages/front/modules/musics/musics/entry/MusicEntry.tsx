import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { Body, BodyProps } from "./body/Body";
import { Header } from "./Header";

type Props = Omit<BodyProps, "setData"> & Partial<Pick<BodyProps, "setData">>;
export function MusicEntryElement(
  props: Props,
) {
  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent:
        Header( {
          entry: props.data,
        } ),
        bodyContent: Body( {
          ...props,
          // eslint-disable-next-line no-empty-function
          setData: props.setData ?? (()=>{ } ),
        } ),
      } )
    }
  </span>;
}
