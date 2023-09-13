
type Props = {
  meta: {
    title?: string;
    artist?: string;
  };
  state?: string;
  volume?: number;
  time: {
    current?: number;
    length?: number;
  };
  length?: string;
  actions: {
    pauseToggle: ()=> void;
    previous: ()=> void;
    next: ()=> void;
    stop: ()=> void;
    seek: (time: number | string)=> void;
  };
};

export default function MediaPlayer( { meta:{title, artist}, state, volume, time:{current,length}, actions: {previous, next, stop, seek, pauseToggle} }: Props) {
  const {current: currentTime, endsAt, remaining, length: lengthStr} = timeRepresentation(current, length);

  return (
    <>
      <h2>{title}</h2>
      <a>{artist}</a>
      <br/>
      <br/>
      <span>{currentTime} / {lengthStr}</span> <br/>
      Restante: -{remaining} ({endsAt}) <br/>
      <span style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      }}>
        <button onClick={()=>previous()}>Previous</button>
        <button onClick={()=>seek(-5)}>-5</button>
        {playPauseButton(state, pauseToggle)}
        <button onClick={()=>stop()}>Stop</button>
        <button onClick={()=>seek("+5")}>+5</button>
        <button onClick={()=>next()}>Next</button>
      </span>
        Volumen: {Math.round(((volume ?? 0) / 256) * 100)} % <br/>
    </>
  );
}

function secToHMS(sec: number): string {
  if (sec < 0)
    return "-";

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

function timeRepresentation(time, length) {
  const hasTime = length >= 0;
  let timeStr = "-";
  let remainingStr = "-";
  let endsAtStr = "-";
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
    contentStr = "\u23F8";
  else
    contentStr = "►";

  return <a style={{
    textDecoration: "none",
    height: "3em",
    width: "3em",
    textAlign: "center",
  }}onClick={pauseToggle}><span style={{
      fontSize: "2.5em",
    }}>{contentStr}</span></a>;
}