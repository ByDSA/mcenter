import { useMemo } from "react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FavButton } from "#modules/ui-kit/FavButton";
import { PropsOf } from "#modules/utils/react";
import { useMusic } from "../hooks";
import { MusicPlaylistsApi } from "./requests";

type Props = Omit<PropsOf<typeof FavButton>, "disabled" | "onFavorite" |
  "onUnfavorite" | "value"> & {
  favoritesPlaylistId: string | null;
  musicId: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistFavButton = ( { favoritesPlaylistId,
  musicId, ...props }: Props) => {
  const disabled = useMemo(()=>favoritesPlaylistId === null, [favoritesPlaylistId]);
  const { data: music } = useMusic(musicId);

  return <FavButton
    value={music?.isFav ?? false}
    disabled={disabled}
    onFavorite={useMemo(()=>async (_) => {
      const api = FetchApi.get(MusicPlaylistsApi);

      await api.addOneTrack(favoritesPlaylistId!, musicId, {
        unique: true,
      } );

      useMusic.updateCacheWithMerging(musicId, {
        isFav: true,
      } );
    }, [favoritesPlaylistId, musicId])}
    onUnfavorite={useMemo(()=>async (_) => {
      const api = FetchApi.get(MusicPlaylistsApi);

      await api.removeAllTracksByMusicId( {
        playlistId: favoritesPlaylistId!,
        musicId: musicId,
      } );
      useMusic.updateCacheWithMerging(musicId, {
        isFav: false,
      } );
    }, [favoritesPlaylistId, musicId])}
    {...props} />;
};
