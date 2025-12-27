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
  const handleInteraction = useCallback((e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    if (!progressBarRef.current)
      return;

    const rect = progressBarRef.current.getBoundingClientRect();
    // 'clientX' existe en PointerEvents de forma nativa, igual que en MouseEvents
    const x = (e as PointerEvent).clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const hoverTime = duration ? (duration / 100) * percentage : undefined;

    if (isClick.current && hoverTime !== undefined) {
      setCurrentTime(hoverTime, {
        audioRef,
      } );
    }

    setHover( {
      pos: percentage,
      time: hoverTime !== undefined ? secsToMmss(hoverTime) : TIME_UNDEFINED,
    } );
  }, [duration, audioRef, setCurrentTime]);

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isClick.current)
        return;

      handleInteraction(e);
    };
    const handleGlobalPointerUp = () => {
      if (!isClick.current)
        return;

      isClick.current = false;
      setHover(null);
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [handleInteraction]);

  const percentage = duration ? currentTime / duration * 100 : 0;

  return (
    <div
      ref={progressBarRef}
      className={classes(styles.container, className)}
      onPointerDown={(e) => {
        isClick.current = true;
        handleInteraction(e);
      }}
      onPointerEnter={(e)=>{
        if (isClick.current)
          return;

        handleInteraction(e);
      }}
      onPointerOut={()=>{
        if (isClick.current)
          return;

        setHover(null);
      }}
      onPointerMove={(e)=>{
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
