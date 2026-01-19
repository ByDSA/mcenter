import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { useCallback, useState } from "react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { MusicFileInfosApi } from "../requests";
import { EditFileInfosForm } from "./Form";

export type LoaderProps = {
  musicId: string;
};

export function EditFileInfosLoader( { musicId }: LoaderProps) {
  const [data, setData] = useState<MusicFileInfoEntity[]>([]);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicFileInfosApi);
    const result = await api.getAllByMusicId(musicId);

    return result.data;
  }, [musicId]);

  return <AsyncLoader
    errorElement={<div>Error al cargar los archivos de música</div>}
    action={fetchData}
    onSuccess={r=>setData(r)}
  >
    <LocalDataProvider data={data} setData={setData}>
      <EditFileInfosForm
        musicId={musicId}
      />
    </LocalDataProvider>
  </AsyncLoader>;
}
