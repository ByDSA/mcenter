import { assertIsDefined } from "$shared/utils/validation";
import { useCallback, useState } from "react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { MusicPlaylistsApi } from "./requests";
import { MusicPlaylistEntity } from "./models";
import { PlaylistSelector, PlayListSelectorIsAddedFn } from "./Selector/List";

type Props = {
  userId: string;
  isAdded?: PlayListSelectorIsAddedFn;
  onSelect: (playlist: MusicPlaylistEntity | null)=> void;
};
export function useMusicPlaylistsForUser( { userId, isAdded, onSelect }: Props) {
  const [data, setData] = useState<MusicPlaylistEntity[] | null>(null);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicPlaylistsApi);
    const result = await api.getManyByUserCriteria(userId, {
      limit: 0,
      expand: ["imageCover"],
    } );

    return result.data;
  }, [userId]);

  assertIsDefined(userId);
  const element = <AsyncLoader
    errorElement={<div>Error al cargar playlists</div>}
    action={fetchData}
    onSuccess={r=>setData(r)}
  >{
      (data?.length ?? 0) === 0
        ? (
          <div style={{
            padding: "1rem",
            textAlign: "center",
          }}>No hay playlists disponibles</div>
        )
        : (
          <PlaylistSelector data={data!} isAdded={isAdded} onSelect={onSelect} />
        )
    }
  </AsyncLoader>;

  return {
    element,
    setData,
    fetchData,
    isSuccess: data !== null,
  };
}
