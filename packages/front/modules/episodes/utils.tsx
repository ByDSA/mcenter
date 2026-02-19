import { DaInputErrorWrap } from "#modules/ui-kit/form/InputErrorWrap";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { EpisodeEntity } from "./models";

export function episodeIdInfoElement(episode: EpisodeEntity) {
  return <DaInputGroup>
    <DaInputGroupItem inline>
      <DaLabel>Key</DaLabel>
      <DaInputErrorWrap>
        <span>{episode.episodeKey}</span>
      </DaInputErrorWrap>
    </DaInputGroupItem>
    <DaInputGroupItem inline>
      <DaLabel>Título</DaLabel>
      <DaInputErrorWrap>
        <span>{episode.title}</span>
      </DaInputErrorWrap>
    </DaInputGroupItem>
  </DaInputGroup>;
}
