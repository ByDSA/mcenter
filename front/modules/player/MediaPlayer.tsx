import { PlayerActions } from "#shared/models/player";
import { FastRewind, Pause, SkipNext, SkipPrevious, Stop } from "@mui/icons-material";
import FastForwardIcon from "@mui/icons-material/FastForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useState } from "react";
import styles from "./MediaPlayer.module.css";

enum TimeMode {
  FORWARD,
  REMAINING,
}

type Props = {
  meta: {
    title: string;
    artist: string;
  };
  state?: string;
  volume?: number;
  time: {
    start?: number;
    current: number;
    length: number;
  };
  length?: string;
  player: PlayerActions;
};

export default function MediaPlayer( { meta:{title, artist}, state, volume, time:{current = 0, start = 0, length}, player }: Props) {
  const currentStartFixed = current - start;
  const {current: currentTime, endsAt, remaining, length: lengthStr} = timeRepresentation(currentStartFixed, length);
  const percentage = length !== undefined ? (currentStartFixed / length) * 100 : 0;
  const [mode, setMode] = useState(TimeMode.FORWARD);
  let time1;
  let time2;

  switch (mode) {
    // eslint-disable-next-line default-case-last
    default:
    case TimeMode.FORWARD:
      time1 = currentTime;
      time2 = lengthStr;
      break;
    case TimeMode.REMAINING:
      time1 = `-${remaining}`;
      time2 = endsAt;
  }

  const onClickChangeMode = (e) => {
    e.preventDefault();
    setMode((mode + 1) % 2);
  };

  return (
    <>
      <div className={styles.outContainer}>
        <div className={styles.playerBox}>
          <header>
            <h2 className={styles.title}>{title}</h2>
            <h3 className={styles.artist}>{artist}</h3>
          </header>
          <section>
            <div className={styles.timeDiv}><span className={styles.time} onClick={onClickChangeMode}>{time1}</span>{progressBar(percentage, player.seek, start, length)}<span className={styles.time} onClick={onClickChangeMode}>{time2}</span></div>
            <span className={styles.controls}>
              <span className={`${styles.btn} btnClickable`} onClick={()=>player.previous()}><SkipPrevious fontSize="large"/></span>
              <span className={`${styles.btn} btnClickable`} onClick={()=>player.seek(-10)}><FastRewind fontSize="large" /></span>
              {playPauseButton(state, player.pauseToggle)}
              <span className={`${styles.btn} btnClickable`} onClick={()=>player.seek("+10")}><FastForwardIcon fontSize="large"/></span>
              <span className={`${styles.btn} btnClickable`} onClick={()=>player.next()}><SkipNext fontSize="large" /></span>
              <span className={`${styles.btn} btnClickable`} onClick={()=>player.stop()}><Stop fontSize="large" /></span>
            </span>
            <span className={styles.controlsVolume}>
              <span className={`${styles.btn} btnClickable`}>-</span> <span>{Math.round(((volume ?? 0) / 256) * 100)}%</span> <span className={`${styles.btn} btnClickable`}>+</span><br/>
            </span>
          </section>
        </div>
      </div>
    </>
  );
}

function progressBar(percentage, seek, start: number, length: number) {
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState( {
    top: 0,
    left: 0,
  } );
  const hideTooltip = () => {
    setTooltipText("");
  };
  const update = (e) => {
    const x = e.clientX - e.target.getBoundingClientRect().left;
    const percentage2 = (x / e.target.getBoundingClientRect().width);

    setTooltipText(secToHMS(length * percentage2));
    setTooltipPosition( {
      top: e.target.getBoundingClientRect().top - 32,
      left: e.target.getBoundingClientRect().left + x - 28,
    } );
  };

  return (
    <>
      <span className={`${styles.progressBar} btnClickable`} onMouseMove={update} onMouseEnter={update}
        onMouseLeave={hideTooltip} onClick={progressBarOnClick(seek, start, length)}>
        <span style={{
          width: `${percentage}%`,
        }}></span>
      </span>
      {tooltipText && (
        <div
          className={styles.tooltip}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {tooltipText}
        </div>
      )}
    </>
  );
}

function progressBarOnClick(seek: (p: number | string)=> void, start: number, length: number) {
  return (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.right - rect.left;
    const percentage = (x / width) * 100;
    const secs = Math.round((length) * (percentage / 100)) + start;

    seek(secs);
  };
}

const TIME_UNDEFINED = "--:--";

function secToHMS(sec: number): string {
  if (sec < 0)
    return TIME_UNDEFINED;

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec - hours * 3600) / 60);
  const seconds = Math.floor(sec - hours * 3600 - minutes * 60);

  if (hours === 0)
    return `${padZero(minutes)}:${padZero(seconds)}`;

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

function timeRepresentation(time: number, length: number) {
  const hasTime = length >= 0;
  let timeStr = TIME_UNDEFINED;
  let remainingStr = TIME_UNDEFINED;
  let endsAtStr = `${TIME_UNDEFINED }:--`;
  const lengthStr = secToHMS(length);

  if (hasTime) {
    timeStr = secToHMS(time);
    remainingStr = secToHMS(length - time);
    endsAtStr = new Date((new Date().getTime() + (length - time) * 1000)).toLocaleTimeString();
  }

  return {
    current: timeStr,
    remaining: remainingStr,
    endsAt: endsAtStr,
    length: lengthStr,
  };
}

function playPauseButton(state: string | undefined, pauseToggle): React.JSX.Element {
  let contentStr;

  if (state === "playing")
    contentStr = <Pause fontSize="large"/>;
  else
    contentStr = <PlayArrowIcon fontSize="large"/>;

  return <span className={`${styles.btn} btnClickable`} onClick={pauseToggle}>{contentStr}</span>;
}