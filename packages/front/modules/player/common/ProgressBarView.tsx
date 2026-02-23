"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { secsToMmss } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import styles from "./ProgressBar.module.css";

type Props = {
  className?: string;
  currentTime: number;
  duration: number | null;
  onSeek?: (time: number)=> Promise<void> | void;
};

export const ProgressBarView = ( { onSeek, currentTime, duration, className }: Props) => {
  const percentage = duration ? (currentTime / duration) * 100 : 0;
  const [hover, setHover] = useState<{ pos: number;
time: string; } | null>(null);
  const isClick = useRef(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const handleInteraction = useCallback(
    (e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
      if (!progressBarRef.current)
        return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const x = (e as PointerEvent).clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const hoverTime = duration ? (duration / 100) * pct : undefined;

      if (isClick.current && hoverTime !== undefined)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        onSeek?.(hoverTime);

      setHover( {
        pos: pct,
        time: secsToMmss(hoverTime ?? null),
      } );
    },
    [duration],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (isClick.current)
        handleInteraction(e);
    };
    const onUp = () => {
      if (isClick.current) {
        isClick.current = false;
        setHover(null);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [handleInteraction]);

  return (
    <div
      ref={progressBarRef}
      className={classes(styles.container, className)}
      onPointerDown={(e) => {
        isClick.current = true;
        handleInteraction(e);
      }}
      onPointerEnter={(e) => {
        if (!isClick.current)
          handleInteraction(e);
      }}
      onPointerOut={() => {
        if (!isClick.current)
          setHover(null);
      }}
      onPointerMove={(e) => {
        if (!isClick.current)
          handleInteraction(e);
      }}
    >
      {hover && (
        <div
          className={styles.timeTooltip}
          style={{
            left: `clamp(20px, ${hover.pos}%, calc(100% - 20px))`,
          }}
        >
          {hover.time}
        </div>
      )}
      <div className={styles.progressBackground}>
        <div className={styles.progressFill} style={{
          width: `${percentage}%`,
        }} />
      </div>
      <div
        className={styles.thumb}
        style={{
          left: `calc(${percentage}% - var(--thumb-size)/2)`,
        }}
      />
    </div>
  );
};

type TimeProps = {
  time: number | null;
};
export const TimeView = ( { time }: TimeProps) => {
  const fixedValue = time !== null ? time : null;

  return <span>{secsToMmss(fixedValue)}</span>;
};
