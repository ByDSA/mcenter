import { assertIsDefined } from "$shared/utils/validation";
import { useCrudData } from "#modules/fetching";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicPlaylistsApi } from "./requests";
import { PlaylistEntity } from "./Playlist";

type Props = {
  userId: string;
};
export function useMusicPlaylistsForUser( { userId }: Props) {
  const api = FetchApi.get(MusicPlaylistsApi);

  assertIsDefined(userId);
  const { data, setData, isLoading, error, fetchInitData: fetchData } = useCrudData( {
    initialFetch: async () => {
      const result = await api.getManyByUserCriteria(userId, {
        limit: 0,
      } );

      return result.data;
    },
  } );

  return {
    data: data as PlaylistEntity[] | null,
    isLoading,
    error,
    fetchData,
    setData,
  };
}
