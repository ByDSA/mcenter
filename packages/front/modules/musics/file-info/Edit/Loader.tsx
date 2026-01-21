import { useCallback } from "react";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { assertIsDefined } from "$shared/utils/validation";
import { FetchApi } from "#modules/fetching/fetch-api";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicFileInfosApi } from "../requests";
import { EditFileInfosList } from "./List";
import styles from "./List.module.css";

export type LoaderProps = {
  musicId: string;
};

export function EditFileInfosLoader( { musicId }: LoaderProps) {
  const { setData } = useLocalData<MusicFileInfoEntity[]>();

  assertIsDefined(setData);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicFileInfosApi);
    const result = await api.getAllByMusicId(musicId);

    return result.data;
  }, [musicId]);

  return <section className={styles.container}>
    <AsyncLoader
      errorElement={<div>Error al cargar los archivos de música</div>}
      action={fetchData}
      onSuccess={r=>setData(r)}
    >
      <EditFileInfosList />
    </AsyncLoader>
  </section>;
}
