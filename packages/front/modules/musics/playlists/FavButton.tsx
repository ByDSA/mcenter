import { Favorite } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo } from "react";
import { classes } from "#modules/utils/styles";
import { FetchApi } from "#modules/fetching/fetch-api";
import { logger } from "#modules/core/logger";
import styles from "./FavButton.module.css";
import { MusicPlaylistsApi } from "./requests";

export type UpdateFavButtons = (musicId: string, favorite: boolean)=> void;

type Props = {
  value?: boolean;
  favoritesPlaylistId: string | null;
  musicId: string;
  className?: string;
  updateFavButtons?: UpdateFavButtons;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FavButton = ( { className,
  value = false,
  updateFavButtons,
  favoritesPlaylistId,
  musicId }: Props) => {
  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!favoritesPlaylistId)
      return;

    const api = FetchApi.get(MusicPlaylistsApi);

    if (value) {
      updateFavButtons?.(musicId, false);

      try {
        await api.removeAllTracksByMusicId( {
          playlistId: favoritesPlaylistId,
          musicId: musicId,
        } );
      } catch {
        updateFavButtons?.(musicId, value);
        logger.error("No se pudo quitar de favoritos.");
      }
    } else {
      updateFavButtons?.(musicId, true);
      try {
        await api.addOneTrack(favoritesPlaylistId, musicId, {
          unique: true,
        } );
      } catch {
        updateFavButtons?.(musicId, value);
        logger.error("No se pudo añadir a favoritos.");
      }
    }
  };
  const disabled = useMemo(()=>favoritesPlaylistId === null, [favoritesPlaylistId]);

  return <IconButton
    size="small"
    className={classes(
      className,
      styles.favButton,
      value && styles.active,
      disabled && styles.disabled,
    )}
    onClick={(e)=>disabled ? undefined : onClick?.(e)}
  >
    <Favorite />
  </IconButton>;
};
