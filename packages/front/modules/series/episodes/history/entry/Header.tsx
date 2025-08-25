import { assertIsDefined } from "$shared/utils/validation";
import { HistoryEntryHeader } from "#modules/history";
import { formatDateDDMMYYY, formatDateHHmm } from "#modules/utils/dates";
import { EpisodeHistoryApi } from "../requests";

type HeaderProps = {
  entry: EpisodeHistoryApi.GetMany.Data;
  showDate: boolean;
};
export function Header( { entry, showDate }: HeaderProps) {
  const { resource } = entry;
  const { serie } = resource;

  assertIsDefined(resource);
  assertIsDefined(serie);
  const title = resource.title
    ? `${resource.title}`
    : resource.compKey.episodeKey
    ?? "(Sin título)";
  const subtitle = serie.name ?? resource.compKey.seriesKey;
  const right = resource.compKey.episodeKey;
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
