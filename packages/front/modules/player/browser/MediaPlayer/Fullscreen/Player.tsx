/* eslint-disable @typescript-eslint/naming-convention */
import { MusicImageCover } from "#modules/musics/MusicCover";
import { classes } from "#modules/utils/styles";
import { useMusic } from "#modules/musics/hooks";
import { getMediumCoverUrlFromMusic } from "#modules/musics/musics/MusicEntry/MusicEntry";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, ShuffleButton, RepeatButton, BackwardButton, ForwardButton, CloseButton } from "../OtherButtons";
import { CurrentTime, Duration, ProgressBar } from "../ProgressBar";
import commonStyles from "../MediaPlayerCommon.module.css";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import styles from "./Player.module.css";

export const Player = () => {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const { data: music } = useMusic(currentResource?.resourceId ?? null);

  if (!music)
    return null;

  const { title, artist } = music;
  const coverUrl = getMediumCoverUrlFromMusic(music);

  return <section className={styles.content}>
    <section className={styles.coverSection}>
      <div className={styles.coverWrapper}>
        <MusicImageCover
          className={classes(commonStyles.imageCover, styles.imageCover)}
          img={{
            url: coverUrl,
          }}
          icon={{
            className: commonStyles.icon,
          }}
        />
      </div>
    </section>
    <section className={styles.bottomSection}>
      <article className={styles.trackInfo}>
        <p
          className={classes(styles.title, "ellipsis")}
          title={title}
        >{title}</p>
        <p
          className={classes(styles.artist, "ellipsis")}
          title={artist}
        >{artist}</p>
      </article>
      <article className={styles.progressBarWrapper}>
        <ProgressBar />
        <footer className={styles.timeLabelsRow}>
          <CurrentTime />
          <Duration />
        </footer>
      </article>
      <div className={styles.controlsRow}>
        <BackwardButton />
        <section className={styles.controls}>

          <PrevButton/>

          <PlayButton />

          <NextButton />
        </section>
        <ForwardButton />
      </div>
      <div className={styles.controlsRow}>
        <ShuffleButton />
        <CloseButton />
        <RepeatButton />
      </div>
    </section>
  </section>;
};
