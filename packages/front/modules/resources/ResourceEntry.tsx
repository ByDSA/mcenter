import { JSX, ReactNode, useState } from "react";
import { Pause, PlayArrow } from "@mui/icons-material";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { classes } from "#modules/utils/styles";
import styles from "./ListEntry.module.css";
import { ListEntryColumn, ListEntryRow } from "./ListEntry";

export type OnClickMenu = (e: React.MouseEvent<HTMLElement>)=> void;

export type ResourceEntryProps = {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  settings?: {
    onClick: OnClickMenu;
  };
  favButton?: JSX.Element;
  drag?: {
    isDragging: boolean;
    isDraggingGlobal: boolean;
    element: ReactNode;
  };
  play?: {
    onClick: ()=> void;
    isPlaying: boolean;
  };
  index?: number;
};

export function ResourceEntry(
  { title, subtitle, settings, right, favButton, play, drag, index }: ResourceEntryProps,
) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldHaveLeftDiv = !!play || index !== undefined;

  return <span
    className={classes(
      styles.container,
      play?.isPlaying && styles.playing,
    )}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
  >
    {drag?.element}
    {shouldHaveLeftDiv && <div className={classes(styles.leftDiv)}>
      {play && ((isHovered && !drag?.isDraggingGlobal) || play?.isPlaying)
        ? (
          <button className={styles.playButton} onClick={play?.onClick}>
            {play?.isPlaying ? <Pause /> : <PlayArrow />}
          </button>
        )
        : (
          <span className={styles.indexNumber}>{index}</span>
        )}
    </div>
    }
    <span className={classes(styles.main, !shouldHaveLeftDiv && styles.noLeftDiv)}>
      <span className={classes(styles.title, "ellipsis")}>{title}</span>
      <ListEntryRow className={classes(styles.subtitle, "ellipsis")}>{subtitle}</ListEntryRow>
    </span>
    <ListEntryRow className={styles.right}>
      {favButton}
      {right && <ListEntryColumn className={classes(styles.small, styles.info)}>
        {right}
      </ListEntryColumn>
      }
      {settings
        && <><SettingsButton
          theme="dark"
          onClick={(e: React.MouseEvent<HTMLElement>)=>settings!.onClick(e)}
        />
        </>}
    </ListEntryRow>
  </span>;
}
