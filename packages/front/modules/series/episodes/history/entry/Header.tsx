import { assertIsDefined } from "$shared/utils/validation";
import { createHistoryTimeElement, HistoryEntryHeader } from "#modules/history";
import { EpisodeHistoryApi } from "../requests";

type HeaderProps = {
  entry: EpisodeHistoryApi.GetMany.Data;
};
export function Header( { entry }: HeaderProps) {
  const { resource } = entry;
  const { serie } = resource;

  assertIsDefined(resource);
  assertIsDefined(serie);
  const title = resource.title
    ? `${resource.title}`
    : resource.compKey.episodeKey
    ?? "(Sin título)";
  const subtitle = serie.name ?? resource.compKey.seriesKey;
  const right = <span>{resource.compKey.episodeKey}</span>;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return <HistoryEntryHeader
    left={<>
      {createHistoryTimeElement(timeStampDate)}
    </>}
    title={title}
    subtitle={subtitle}
    right={right} />;
}
