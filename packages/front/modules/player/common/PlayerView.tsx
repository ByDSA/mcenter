// front/modules/player/common/PlayerView.tsx
import { ReactNode } from "react";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { classes } from "#modules/utils/styles";
import commonStyles from "./MediaPlayerCommon.module.css";
import styles from "./Player.module.css";

export type PlayerViewControls = {
  backward: ReactNode;
  prev: ReactNode;
  play: ReactNode;
  next: ReactNode;
  forward: ReactNode;
  shuffle: ReactNode;
  repeat: ReactNode;
  close: ReactNode;
};

export type PlayerViewProps = {
  cover: NonNullable<React.ComponentProps<typeof MusicImageCover>>["cover"];
  coverIcon?: NonNullable<React.ComponentProps<typeof MusicImageCover>>["icon"];
  title: string;
  artist: string;
  progressBar: ReactNode;
  currentTime: ReactNode;
  duration: ReactNode;
  controls: PlayerViewControls;
};

export const PlayerView = ( { cover,
  coverIcon,
  title,
  artist,
  progressBar,
  currentTime,
  duration,
  controls }: PlayerViewProps) => (
  <section className={styles.content}>
    <section className={styles.coverSection}>
      <div className={styles.coverWrapper}>
        <MusicImageCover
          className={classes(commonStyles.imageCover, styles.imageCover)}
          size="large"
          cover={cover}
          icon={coverIcon ?? {
            className: commonStyles.icon,
          }}
        />
      </div>
    </section>

    <section className={styles.bottomSection}>
      <article className={styles.trackInfo}>
        <p className={classes(styles.title, "ellipsis")} title={title}>{title}</p>
        <p className={classes(styles.artist, "ellipsis")} title={artist}>{artist}</p>
      </article>

      <article className={styles.progressBarWrapper}>
        {progressBar}
        <footer className={styles.timeLabelsRow}>
          {currentTime}
          {duration}
        </footer>
      </article>

      <div className={styles.controlsRow}>
        {controls.backward}
        <section className={styles.controls}>
          {controls.prev}
          {controls.play}
          {controls.next}
        </section>
        {controls.forward}
      </div>

      <div className={styles.controlsRow}>
        {controls.shuffle}
        {controls.close}
        {controls.repeat}
      </div>
    </section>
  </section>
);
