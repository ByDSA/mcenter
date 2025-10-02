import { useState } from "react";
import { ResourceAccordion } from "#modules/ui-kit/accordion";
import { EpisodeHistoryApi } from "../requests";
import { Header } from "./Header";
import { Body } from "./body/Body";

type Props = {
  value: EpisodeHistoryApi.GetMany.Data;
  setValue: ReturnType<typeof useState<EpisodeHistoryApi.GetMany.Data>>[1];
};
export function HistoryEntryElement( { value, setValue }: Props) {
  return <span className="resource-list-entry">
    {
      ResourceAccordion( {
        headerContent: <Header entry={value}/>,
        bodyContent: <Body data={value} setData={setValue}/>,
      } )
    }
  </span>;
}
