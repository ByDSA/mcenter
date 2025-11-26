import type { PlaylistItemEntity } from "./Playlist";
import React, { ReactNode, useState } from "react";
import { IconButton } from "@mui/material";
import { PlayArrow,
  Pause, Favorite,
  FavoriteBorder } from "@mui/icons-material";
import { useUser } from "#modules/core/auth/useUser";
import { classes } from "#modules/utils/styles";
import { FetchApi } from "#modules/fetching/fetch-api";
import { formatDurationItem } from "./utils";
import styles from "./PlaylistItem.module.css";
import { SettingsButton } from "./SettingsButton";
import { MusicPlaylistsApi } from "./requests";

export type ContextMenuProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>)=> void;
  element?: ReactNode;
};

interface PlaylistItemProps {
  contextMenu?: ContextMenuProps;
  value: PlaylistItemEntity;
  index: number;
  isPlaying?: boolean;
  isDragging?: boolean;
  onPlay?: (item: PlaylistItemEntity)=> void;
  onPause?: ()=> void;
  updateIsFav: (musicId: string, favorite: boolean)=> void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistItem = ( { value,
  index,
  isPlaying = false,
  contextMenu,
  isDragging = false,
  updateIsFav,
  onPlay,
  onPause }: PlaylistItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(!!value.music.isFav);
  const { user } = useUser();
  const handlePlayPause = () => {
    if (isPlaying)
      onPause?.();
    else
      onPlay?.(value);
  };
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user || !user.musics.favoritesPlaylistId)
      return;

    const api = FetchApi.get(MusicPlaylistsApi);

    if (isFavorite) {
      await api.removeAllTracksByMusicId( {
        playlistId: user.musics.favoritesPlaylistId,
        musicId: value.musicId,
      } );

      updateIsFav(value.musicId, false);
    } else {
      await api.addOneTrack(user.musics.favoritesPlaylistId, value.musicId, {
        unique: true,
      } );

      updateIsFav(value.musicId, true);
    }

    setIsFavorite(!isFavorite);
  };

  return (
    <div
      className={`${styles.playlistItem} ${isPlaying ? styles.playing : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.indexContainer}>
        {(isHovered && !isDragging) || isPlaying
          ? (
            <button className={styles.playButton} onClick={handlePlayPause}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </button>
          )
          : (
            <span className={styles.indexNumber}>{index + 1}</span>
          )}
      </div>

      <div className={styles.songInfo}>
        <h4 className={`${styles.songTitle} ${isPlaying ? styles.playing : ""}`}>
          {value.music.title}
        </h4>
        <div className={styles.songDetails}>
          <span className={styles.songArtist}>{value.music.artist}</span>
          <span className={styles.separator}>•</span>
          <span className={styles.songAlbum}>{value.music.album}</span>
        </div>
      </div>

      <div className={styles.duration}>
        {formatDurationItem(value.music.fileInfos[0].mediaInfo.duration ?? 0)}
      </div>

      <div className={styles.actions}>
        {user && <IconButton
          size="small"
          className={classes(
            styles.favButton,
            isFavorite && styles.active,
            !user.musics.favoritesPlaylistId && styles.disabled,
          )}
          onClick={(e)=>user.musics.favoritesPlaylistId ? handleFavoriteToggle(e) : undefined}
        >
          {isFavorite ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
        }
        {contextMenu?.onClick
        && <><SettingsButton
          theme="dark"
          className={styles.settingsButton}
          onClick={(e: React.MouseEvent<HTMLElement>)=>contextMenu.onClick?.(e)}
        />
        {contextMenu.element}
        </>}
      </div>
    </div>
  );
};
