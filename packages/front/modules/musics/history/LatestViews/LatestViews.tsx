import { useCallback, useState } from "react";
import { MusicHistoryEntry } from "$shared/models/musics/history";
import { DateFormat } from "#modules/utils/dates";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { useMusic } from "#modules/musics/hooks";
import { FetchApi } from "#modules/fetching/fetch-api";
import { musicIdInfoElement } from "#modules/musics/utils";
import { LatestViewsView } from "../../../history/Latest/LatestViewsDisplay";
import { MusicHistoryApi } from "../requests";

type Props = {
  musicId: string;
  maxTimestamp?: number;
  dateFormat?: DateFormat;
  autoStart?: boolean;
};

export function MusicLatestViews(props: Props) {
  const [data, setData] = useState<MusicHistoryEntry[]>([]);
  const { musicId, maxTimestamp = new Date().getTime(), dateFormat } = props;
  const { data: music } = useMusic(props.musicId);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicHistoryApi);
    const result = await api.getLatestsViews(musicId, maxTimestamp);

    return result.data;
  }, [musicId, maxTimestamp]);
  const element = <AsyncLoader
    errorElement={<div>Error al cargar el historial</div>}
    action={fetchData}
    onSuccess={r=>setData(r)}
  ><LatestViewsView
      dates={data.map((d) => d.date.timestamp)}
      dateFormat={dateFormat}
    />
  </AsyncLoader>;

  if (!music)
    return element;

  return <>
    {musicIdInfoElement(music)}
    {element}
  </>;
}
