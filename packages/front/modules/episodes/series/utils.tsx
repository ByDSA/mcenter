import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { SeriesEntity } from "./models";

export function seriesIdInfoElement(series: SeriesEntity) {
  return <DaInputGroup>
    <DaInputGroupItem inline>
      <DaLabel>Nombre</DaLabel>
      <DaInputErrorWrap>
        <span>{series.name}</span>
      </DaInputErrorWrap>
    </DaInputGroupItem>
  </DaInputGroup>;
}
