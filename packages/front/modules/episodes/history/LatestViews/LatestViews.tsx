import { useCallback, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { DateFormat } from "#modules/utils/dates";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { LatestViewsView } from "#modules/history/Latest/LatestViewsDisplay";
import { Separator } from "#modules/resources/Separator/Separator";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useEpisode } from "#modules/episodes/hooks";
import { EpisodeHistoryApi } from "../requests";
import { EpisodeHistoryEntryCrudDtos } from "../models/dto";

type Props = {
  episodeId: string;
  maxTimestamp?: number;
  dateFormat?: DateFormat;
  autoStart?: boolean;
};

export function EpisodeLatestViews(props: Props) {
  const { maxTimestamp = new Date().getTime(), dateFormat, episodeId } = props;
  const { data: episode } = useEpisode(episodeId);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(EpisodeHistoryApi);

    assertIsDefined(episode);
    const result = await api.getLatestViews(
      episode.compKey.seriesKey,
      episode.compKey.episodeKey,
      maxTimestamp,
    );

    return result.data;
  }, [episodeId, maxTimestamp]);
  const [data, setData] = useState<EpisodeHistoryEntryCrudDtos.GetMany.Response["data"]>();
  const element = <AsyncLoader
    errorElement={<div>Error al cargar el historial</div>}
    onSuccess={r=>setData(r)}
    action={fetchData}
  >
    {data && <LatestViewsView
      dates={data.map((d) => d.date.timestamp)}
      dateFormat={dateFormat}
    />}
  </AsyncLoader>;

  if (!episode)
    return element;

  return <>
    <DaInputGroup>
      <DaInputGroupItem inline>
        <DaLabel>Título</DaLabel>
        <span>{episode.title}</span>
      </DaInputGroupItem>
      <DaInputGroupItem inline>
        <DaLabel>Episodio</DaLabel>
        <span><span>{episode.serie?.name ?? data?.[0]?.resource.serie?.name
        ?? episode.compKey.seriesKey}</span><Separator /><span>{episode.compKey.episodeKey}</span></span>
      </DaInputGroupItem>
    </DaInputGroup>
    {element}
  </>;
}
