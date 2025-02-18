import { MusicHistoryEntry } from "#modules/musics/history/models";
import { HistoryEntryHeader } from "#modules/history";
import { formatDate, formatDateHHmm } from "#modules/utils/dates";

type HeaderProps = {
  entry: Required<MusicHistoryEntry>;
  showDate: boolean;
};
export function Header( { entry, showDate }: HeaderProps) {
  const { resource } = entry;
  const { title } = resource;
  const subtitle = resource.game ?? resource.artist;
  const right = resource.weight.toString();
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
