import { assertIsDefined } from "$shared/utils/validation";
import { HistoryEntryHeader } from "#modules/history";
import { formatDateDDMMYYY, formatDateHHmm } from "#modules/utils/dates";
import { EpisodeHistoryEntryFetching } from "../requests";

type HeaderProps = {
  entry: EpisodeHistoryEntryFetching.GetMany.Data;
  showDate: boolean;
};
export function Header( { entry, showDate }: HeaderProps) {
  const { episode, serie } = entry;

  assertIsDefined(episode);
  assertIsDefined(serie);
  const title = episode.title ? `${episode.title}` : episode.compKey.episodeKey ?? "(Sin título)";
  const subtitle = serie.name ?? episode.compKey.seriesKey;
  const right = episode.compKey.episodeKey;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return <HistoryEntryHeader
    time={formatDateHHmm(timeStampDate)}
    date={showDate
      ? formatDateDDMMYYY(timeStampDate)
      : undefined}
    title={title}
    subtitle={subtitle}
    right={right} />;
}
