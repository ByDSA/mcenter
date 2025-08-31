import { MusicEntity } from "$shared/models/musics";
import { HistoryEntryHeader } from "#modules/history";

type HeaderProps = {
  entry: MusicEntity;
};
export function Header( { entry }: HeaderProps) {
  const resource = entry;
  const { title } = resource;
  const subtitle = resource.game ?? resource.artist;
  const right = resource.weight.toString();
  const duration = resource.fileInfos?.[0]?.mediaInfo.duration;

  return HistoryEntryHeader( {
    time: duration ? "Duration:" + duration : "",
    date: undefined,
    title,
    subtitle,
    right,
  } );
}
