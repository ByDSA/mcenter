import { isDefined } from "$shared/utils/validation";
import { WithRequired } from "@tanstack/react-query";
import { MusicHistoryEntryEntity } from "#modules/musics/history/models";
import { createDurationElement, createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";

type HeaderProps = {
  entry: WithRequired<MusicHistoryEntryEntity, "resource">;
};
export function Header( { entry }: HeaderProps) {
  const { resource } = entry;
  const { title } = resource;
  const duration = resource.fileInfos?.[0].mediaInfo.duration;
  const subtitle = resource.game ?? resource.artist;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return HistoryEntryHeader( {
    left: <>
      {createHistoryTimeElement(timeStampDate)}
    </>,
    title,
    subtitle,
    right: <>
      {isDefined(duration) && createDurationElement(duration)}
      {createWeightElement(resource.weight) }
    </>,
  } );
}
