import type { PlaylistItemEntity } from "./Playlist";
import React, { ReactNode, useState } from "react";
import { PlayArrow,
  Pause } from "@mui/icons-material";
import { useUser } from "#modules/core/auth/useUser";
import { formatDurationItem } from "./utils";
import styles from "./PlaylistItem.module.css";
import { SettingsButton } from "./SettingsButton";
import { FavButton, UpdateFavButtons } from "./FavButton";

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
  updateFavButtons?: UpdateFavButtons;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistItem = ( { value,
  index,
  isPlaying = false,
  contextMenu,
  isDragging = false,
  updateFavButtons,
  onPlay,
  onPause }: PlaylistItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useUser();
  const handlePlayPause = () => {
    if (isPlaying)
      onPause?.();
    else
      onPlay?.(value);
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
          <span className={styles.songAlbum}>{
            !value.music.album || value.music.album.trim() === ""
              ? "(Sin álbum)"
              : value.music.album}</span>
        </div>
      </div>

      <div className={styles.duration}>
        {formatDurationItem(value.music.fileInfos[0].mediaInfo.duration ?? 0)}
      </div>

      <div className={styles.actions}>
        {user && <FavButton
          value={!!value.music.isFav}
          favoritesPlaylistId={user.musics.favoritesPlaylistId}
          musicId={value.music.id}
          updateFavButtons={updateFavButtons}
        />
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
