import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeHistoryEntryEntity } from "#modules/series/episodes/history/models";
import { HistoryEntryHeader } from "#modules/history";
import { formatDateDDMMYYY, formatDateHHmm } from "#modules/utils/dates";

type HeaderProps = {
  entry: EpisodeHistoryEntryEntity;
  showDate: boolean;
};
export function Header( { entry, showDate }: HeaderProps) {
  const { episode, serie } = entry;

  assertIsDefined(episode);
  assertIsDefined(serie);
  const title = episode.title ? `${episode.title}` : episode.id.innerId ?? "(Sin título)";
  const subtitle = serie.name ?? episode.id.serieId;
  const right = episode.id.innerId;
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
