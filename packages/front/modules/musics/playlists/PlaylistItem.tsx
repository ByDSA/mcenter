import type { PlaylistItemEntity } from "./Playlist";
import React, { ReactNode, useState } from "react";
import { PlayArrow,
  Pause } from "@mui/icons-material";
import { useUser } from "#modules/core/auth/useUser";
import { classes } from "#modules/utils/styles";
import { OnClickMenu } from "#modules/resources/ResourceEntry";
import { formatDurationItem } from "./utils";
import { SettingsButton } from "./SettingsButton";
import { PlaylistFavButton } from "./PlaylistFavButton";
import styles from "./PlaylistItem.module.css";
import playlistStyles from "./Playlist.module.css";

export type ContextMenuProps = {
  onClick?: (e: React.MouseEvent<HTMLElement>)=> void;
  element?: ReactNode;
};

interface PlaylistItemProps {
  onClickMenu?: OnClickMenu;
  value: PlaylistItemEntity;
  index: number;
  isPlaying?: boolean;
  isDragging?: boolean;
  onPlay?: (item: PlaylistItemEntity)=> void;
  onPause?: ()=> void;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistItem = ( { value,
  index,
  isPlaying = false,
  onClickMenu,
  className,
  isDragging = false,
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
      className={classes(
        styles.playlistItem,
        isPlaying && styles.playing,
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={classes(styles.indexContainer, playlistStyles.headerIndex)}>
        {(isHovered && !isDragging) || isPlaying
          ? (
            <button className={styles.playButton} onClick={handlePlayPause}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </button>
          )
          : (
            <span className={styles.indexNumber}>{index
              + 1}</span>
          )}
      </div>

      <div className={classes(playlistStyles.headerTitle, styles.songInfo)}>
        <h4 className={`${styles.songTitle} ${isPlaying ? styles.playing : ""}`}>
          {value.music.title}
        </h4>
        <div className={styles.songDetails}>
          <span className={styles.songArtist}>{value.music.artist}</span>
          <span className={classes(styles.separator, styles.albumShowHide)}>•</span>
          <span className={classes(styles.songAlbum, styles.albumShowHide)}>{
            !value.music.album || value.music.album.trim() === ""
              ? "(Sin álbum)"
              : value.music.album}</span>
        </div>
      </div>

      <div className={classes(playlistStyles.headerDuration, styles.duration)}>
        {formatDurationItem(value.music.fileInfos[0].mediaInfo.duration ?? 0)}
      </div>

      <div className={classes(playlistStyles.headerActions, styles.actions)}>
        {user && <PlaylistFavButton
          initialValue={!!value.music.isFav}
          favoritesPlaylistId={user.musics.favoritesPlaylistId}
          musicId={value.music.id}
        />
        }
        {onClickMenu && <><SettingsButton
          theme="dark"
          className={styles.settingsButton}
          onClick={(e: React.MouseEvent<HTMLElement>)=>onClickMenu?.(e)}
        />
        </>}
      </div>
    </div>
  );
};
