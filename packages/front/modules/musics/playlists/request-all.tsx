import { assertIsDefined } from "$shared/utils/validation";
import { useCallback, useState } from "react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useAsyncElement } from "#modules/utils/usePageAsyncAction";
import { ContentSpinner } from "#modules/ui-kit/spinner/Spinner";
import { MusicPlaylistsApi } from "./requests";
import { MusicPlaylistEntity } from "./models";
import { PlaylistSelector } from "./list-selector/List";

type Props = {
  userId: string;
  onSelect: (playlist: MusicPlaylistEntity | null)=> void;
};
export function useMusicPlaylistsForUser( { userId, onSelect }: Props) {
  const [data, setData] = useState<MusicPlaylistEntity[] | null>(null);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicPlaylistsApi);
    const result = await api.getManyByUserCriteria(userId, {
      limit: 0,
    } );

    setData(result.data);
  }, [userId]);

  assertIsDefined(userId);
  const { element } = useAsyncElement( {
    loadingElement: (
      <div style={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
      }}>
        <ContentSpinner size={4}/>
      </div>
    ),
    errorElement: <div>Error al cargar playlists</div>,
    action: fetchData,
    renderElement: ()=>data!.length === 0
      ? (
        <div style={{
          padding: "1rem",
          textAlign: "center",
        }}>No hay playlists disponibles</div>
      )
      : (
        <PlaylistSelector data={data!} onSelect={onSelect} />
      ),
  } );

  return {
    element,
    setData,
    fetchData,
    isSuccess: data !== null,
  };
}
