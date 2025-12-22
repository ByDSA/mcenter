import { useMemo } from "react";
import { secsToMmss } from "#modules/utils/dates";
import { TIME_UNDEFINED } from "#modules/remote-player/MediaPlayer";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import styles from "./MediaPlayer.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CurrentTimeLabel = () => {
  const currentTime = useBrowserPlayer(s=>s.currentTime);
  const duration = useBrowserPlayer(s=>s.duration);
  const currentTimeLabel = useMemo(()=>secsToMmss(currentTime), [currentTime]);
  const durationLabel = useMemo(()=>duration ? secsToMmss(duration) : TIME_UNDEFINED, [duration]);

  return useMemo(()=><span className={styles.timeLabel}>{currentTimeLabel} / {durationLabel}</span>, [currentTime, duration]);
};
