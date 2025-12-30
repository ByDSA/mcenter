/* eslint-disable @typescript-eslint/naming-convention */
import { MusicImageCover } from "#modules/musics/MusicCover";
import { classes } from "#modules/utils/styles";
import { secsToMmss } from "#modules/utils/dates";
import { TIME_UNDEFINED } from "#modules/remote-player/MediaPlayer";
import { useMusic } from "#modules/musics/hooks";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, ShuffleButton, RepeatButton } from "../OtherButtons";
import { ProgressBar } from "../ProgressBar";
import commonStyles from "../MediaPlayerCommon.module.css";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import styles from "./Player.module.css";

type Props = {
  audioElement: HTMLAudioElement | null;
};

export const Player = ( { audioElement }: Props) => {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const { data: music } = useMusic(currentResource?.resourceId ?? null);

  if (!music)
    return null;

  const { coverUrl, title, artist } = music;

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
        <ProgressBar audioElement={audioElement} />
        <footer className={styles.timeLabelsRow}>
          <CurrentTime />
          <Duration />
        </footer>
      </article>
      <div className={styles.controlsRow}>
        <ShuffleButton />
        <section className={styles.controls}>
          <PrevButton audioElement={audioElement}/>

          <PlayButton />

          <NextButton />
        </section>
        <RepeatButton />
      </div>
    </section>
  </section>;
};

const CurrentTime = () => {
  const currentTime = useBrowserPlayer(s=>s.currentTime);

  return <span>{secsToMmss(currentTime)}</span>;
};
const Duration = () => {
  const duration = useBrowserPlayer(s=>s.duration);

  return <span>{duration !== undefined ? secsToMmss(duration) : TIME_UNDEFINED}</span>;
};
