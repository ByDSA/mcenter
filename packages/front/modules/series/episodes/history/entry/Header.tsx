import { assertIsDefined } from "$shared/utils/validation";
import { createDurationElement, createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
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
  const subtitle = <>{resource.compKey.episodeKey} • {serie.name ?? resource.compKey.seriesKey}</>;
  const timeStampDate = new Date(entry.date.timestamp * 1000);
  const start = resource.fileInfos[0].start ?? 0;
  const end = resource.fileInfos[0].end ?? resource.fileInfos[0].mediaInfo.duration;
  const duration = end ? (end - start) : undefined;

  return <HistoryEntryHeader
    left={<>
      {createHistoryTimeElement(timeStampDate)}
    </>}
    title={title}
    subtitle={subtitle}
    right={<>
      {duration && createDurationElement(duration)}
      {createWeightElement(resource.weight)}
    </>} />;
}
