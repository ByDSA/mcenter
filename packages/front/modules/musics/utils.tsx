import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { MusicEntity } from "./models";

export function musicIdInfoElement(music: MusicEntity) {
  return <DaInputGroup>
    <DaInputGroupItem inline>
      <DaLabel>Título</DaLabel>
      <DaInputErrorWrap>
        <span>{music.title}</span>
      </DaInputErrorWrap>
    </DaInputGroupItem>
    <DaInputGroupItem inline>
      <DaLabel>Artista</DaLabel>
      <DaInputErrorWrap>
        <span>{music.artist}</span>
      </DaInputErrorWrap>
    </DaInputGroupItem>
  </DaInputGroup>;
}
