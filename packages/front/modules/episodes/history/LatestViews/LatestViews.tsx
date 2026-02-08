import { useCallback, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { DateFormat } from "#modules/utils/dates";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { LatestViewsView } from "#modules/history/Latest/LatestViewsDisplay";
import { Separator } from "#modules/resources/Separator/Separator";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useEpisode } from "#modules/episodes/hooks";
import { useSeries } from "#modules/episodes/series/hooks";
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
  const [data, setData] = useState<EpisodeHistoryEntryCrudDtos.GetMany.Response["data"]>();
  const { data: series } = useSeries(data?.[0]?.resource.seriesId ?? null, {
    notExpandCountEpisodes: true,
    notExpandCountSeasons: true,
    notExpandImageCover: true,
  } );
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(EpisodeHistoryApi);

    assertIsDefined(episode);
    const result = await api.getLatestViews(
      episode.seriesId,
      episode.episodeKey,
      maxTimestamp,
    );

    return result.data;
  }, [episodeId, maxTimestamp]);
  const element = <AsyncLoader
    errorElement={<div>Error al cargar el historial</div>}
    onSuccess={r=>setData(r)}
    action={fetchData}
  >
    {data && <LatestViewsView
      dates={data.map((d) => dateToTimestampInSeconds(d.date))}
      dateFormat={dateFormat}
    />}
  </AsyncLoader>;

  if (!episode || !series)
    return element;

  return <>
    <DaInputGroup>
      <DaInputGroupItem inline>
        <DaLabel>Título</DaLabel>
        <span>{episode.title}</span>
      </DaInputGroupItem>
      <DaInputGroupItem inline>
        <DaLabel>Episodio</DaLabel>
        <span><span>{series.name}</span><Separator /><span>{episode.episodeKey}</span></span>
      </DaInputGroupItem>
    </DaInputGroup>
    {element}
  </>;
}
