import { ReactNode, Fragment } from "react";
import { classes } from "#modules/utils/styles";
import { ResourcePlayButtonView } from "#modules/resources/PlayButton/PlayButton";
import { Separator } from "#modules/resources/Separator/Separator";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import commonStyles from "../Header.module.css";
import styles from "./styles.module.css";

type Props = {
  title: ReactNode;
  cover: ReactNode;
  onPlay?: ()=> void;
  playStatus?: PlayerStatus;
  playDisabled?: boolean;
  settings?: ReactNode;
  info?: ReactNode[];
  className?: string;
};

export const HeaderList = ( { title,
  cover,
  onPlay,
  playStatus = "stopped",
  playDisabled = false,
  settings,
  info,
  className }: Props) => {
  return (
    <header className={classes(commonStyles.header, styles.container, className)}>
      {/* Top Row: Cover + Title */}
      <div className={styles.listTopRow}>
        <div className={classes(commonStyles.coverWrapper, styles.listCover)}>
          {cover}
        </div>
        <span className={styles.listTitle}>{title}</span>
      </div>

      {/* Bottom Row: Controls + Info */}
      <div className={styles.listBottomRow}>
        {onPlay && (
          <ResourcePlayButtonView
            onClick={onPlay}
            status={playStatus}
            disabled={playDisabled}
          />
        )}
        {settings}

        {/* Info next to controls */}
        {info && info.length > 0 && (
          <div className={styles.listInfo}>
            {info.map((item, index) => (
              <Fragment key={index}>
                {index > 0 && <Separator />}
                {item}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
