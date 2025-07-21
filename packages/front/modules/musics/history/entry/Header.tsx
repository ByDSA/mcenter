import { MusicHistoryEntryEntity } from "#modules/musics/history/models";
import { HistoryEntryHeader } from "#modules/history";
import { formatDate, formatDateHHmm } from "#modules/utils/dates";

type HeaderProps = {
  entry: Required<MusicHistoryEntryEntity>;
  showDate: boolean;
};
export function Header( { entry, showDate }: HeaderProps) {
  const { music } = entry;
  const { title } = music;
  const subtitle = music.game ?? music.artist;
  const right = music.weight.toString();
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return HistoryEntryHeader( {
    time: formatDateHHmm(timeStampDate),
    date: showDate
      ? formatDate(timeStampDate, {
        dateTime: "date",
        ago: "no",
      } )
      : undefined,
    title,
    subtitle,
    right,
  } );
}
