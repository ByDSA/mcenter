import { useMemo } from "react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FavButton } from "#modules/ui-kit/FavButton";
import { PropsOf } from "#modules/utils/react";
import { MusicPlaylistsApi } from "./requests";

type Props = Omit<PropsOf<typeof FavButton>, "disabled" | "onFavorite" | "onUnfavorite"> & {
  favoritesPlaylistId: string | null;
  musicId: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistFavButton = ( { favoritesPlaylistId,
  musicId, ...props }: Props) => {
  const disabled = useMemo(()=>favoritesPlaylistId === null, [favoritesPlaylistId]);

  return <FavButton
    disabled={disabled}
    onFavorite={useMemo(()=>async (_) => {
      const api = FetchApi.get(MusicPlaylistsApi);

      await api.addOneTrack(favoritesPlaylistId!, musicId, {
        unique: true,
      } );
    }, [favoritesPlaylistId, musicId])}
    onUnfavorite={useMemo(()=>async (_) => {
      const api = FetchApi.get(MusicPlaylistsApi);

      await api.removeAllTracksByMusicId( {
        playlistId: favoritesPlaylistId!,
        musicId: musicId,
      } );
    }, [favoritesPlaylistId, musicId])}
    {...props} />;
};
