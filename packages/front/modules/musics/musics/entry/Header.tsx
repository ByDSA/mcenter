import { MusicEntity } from "$shared/models/musics";
import { isDefined } from "$shared/utils/validation";
import { HistoryEntryHeader } from "#modules/history";
import { secsToMmss } from "#modules/utils/dates";
import styles from "./Header.module.css";

type HeaderProps = {
  entry: MusicEntity;
};
export function Header( { entry }: HeaderProps) {
  const resource = entry;
  const { title } = resource;
  const subtitle = resource.game ?? resource.artist;
  const duration = resource.fileInfos?.[0]?.mediaInfo.duration;
  const right = <span className={styles.right}>{isDefined(duration) ? <span>{secsToMmss(duration)}</span> : null}<span>W: {resource.weight.toString()}</span></span>;

  return HistoryEntryHeader( {
    time: undefined,
    date: undefined,
    title,
    subtitle,
    right,
  } );
}
