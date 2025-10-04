import { Music, MusicEntity } from "$shared/models/musics";
import { createDurationElement, createWeightElement, HistoryEntryHeader } from "#modules/history";

type HeaderProps = {
  entry: MusicEntity;
};
export function Header( { entry }: HeaderProps) {
  const resource = entry;
  const { title } = resource;
  const duration = resource.fileInfos?.[0]?.mediaInfo.duration;

  return HistoryEntryHeader( {
    left: undefined,
    right: <>
      {duration && createDurationElement(duration)}
      {createWeightElement(resource.weight)}
    </>,
    title,
    subtitle: createMusicSubtitle(resource),
  } );
}

export function createMusicSubtitle(resource: Music) {
  return resource.game ?? resource.artist;
}
