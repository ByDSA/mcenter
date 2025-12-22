import { RefObject, useState, useEffect, useRef, useCallback } from "react";
import { secsToMmss } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import { TIME_UNDEFINED } from "#modules/remote-player/MediaPlayer";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./ProgressBar.module.css";

type Props = {
  audioRef: RefObject<HTMLAudioElement | null>;
  className?: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProgressBar = ( { audioRef, className }: Props) => {
  const currentTime = useBrowserPlayer(s=>s.currentTime);
  const duration = useBrowserPlayer(s=>s.duration);
  const setCurrentTime = useBrowserPlayer(s=>s.setCurrentTime);
  const [hover, setHover] = useState<{ pos: number;
time: string; } | null>(null);
  const isClick = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current)
      return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const hoverTime = duration ? (duration / 100) * percentage : undefined;

    if (isClick.current && hoverTime !== undefined) {
      setCurrentTime(hoverTime, {
        audioRef,
      } );
    }

    setHover( {
      pos: percentage,
      time: hoverTime ? secsToMmss(hoverTime) : TIME_UNDEFINED,
    } );
  }, [duration]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isClick.current)
        return;

      handleInteraction(e);
    };
    const handleGlobalMouseUp = () => {
      if (!isClick.current)
        return;

      isClick.current = false;
      setHover(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleInteraction, setHover]);

  const percentage = duration ? currentTime / duration * 100 : 0;

  return (
    <div
      ref={progressBarRef}
      className={classes(styles.container, className)}
      onMouseDown={(e) => {
        isClick.current = true;
        handleInteraction(e);
      }}
      onMouseEnter={(e)=>{
        if (isClick.current)
          return;

        handleInteraction(e);
      }}
      onMouseOut={()=>{
        if (isClick.current)
          return;

        setHover(null);
      }}
      onMouseMove={(e)=>{
        if (isClick.current)
          return;

        handleInteraction(e);
      }}
    >
      {hover && (
        <div className={styles.timeTooltip} style={{
          left: `clamp(20px, ${hover.pos}%, calc(100% - 20px))`,
        }}>
          {hover.time}
        </div>
      )}
      <div className={styles.progressBackground}>
        <div className={styles.progressFill} style={{
          width: `${percentage}%`,
        }} />
      </div>
      <div
        className={classes(styles.thumb, isClick.current && styles.thumbActive)}
        style={{
          left: `calc(${percentage}% - var(--thumb-size)/2)`,
        }}
      />
    </div>
  );
};
