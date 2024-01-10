import { HistoryMusicEntry } from "#shared/models/musics";
import Loading from "app/loading";
import { Fragment } from "react";
import style from "./style.module.css";
import { dateInLastestComponent, secsToMS } from "./utils";

type Props = {
  resource: Required<HistoryMusicEntry>["resource"];
  weightState: [number, React.Dispatch<React.SetStateAction<number>>];
  lastest?: HistoryMusicEntry[];
};
export default function Body( {resource, weightState, lastest}: Props) {
  const [weight, setWeight] = weightState;
  const reset = () => {
    setWeight(resource.weight);
  };

  return <div className={style.dropdown}>
    <span>Título: {resource.title}</span>
    <span className={style.break} />
    <span>Artista: {resource.artist}</span>
    <span className={style.break} />
    <span>Tags: {resource.tags?.join(", ")}</span>
    {resource.game && <>
      <span className={style.break} />
      <span>Game: {resource.game}</span>
    </>}
    {resource.country && <>
      <span className={style.break} />
      <span>Country: {resource.country}</span>
    </>}
    <span className={style.break} />
    <span className={`${style.weight}`}>
      <span>Weight:</span> <input type="number" value={weight} onChange={handleOnChange(setWeight)}/>
    </span>
    {(resource.mediaInfo.duration && resource.mediaInfo.duration > 0 && <>
      <span className={style.break} />
      <span>Duration : {secsToMS(resource.mediaInfo.duration)} ({resource.mediaInfo.duration} s)</span>
    </>) || null}
    <span className={style.break} />
    <span><a onClick={() => reset()}>Reset</a></span>
    <span className={style.break} />
    <span className={style.break} />
    {lastestComponent(lastest)}

  </div>;
}

function lastestComponent(lastest: HistoryMusicEntry[] | undefined) {
  if (!lastest)
    return <Loading/>;

  if (lastest.length === 0)
    return <span>No se había reproducido antes.</span>;

  return <>
    <span>Últimas veces:</span>
    {lastest && lastest.map((entry: HistoryMusicEntry) => <Fragment key={`${entry.date.timestamp}`}>
      <><span className={style.break} /><span>{dateInLastestComponent(new Date(entry.date.timestamp * 1000))}</span></>
    </Fragment>)}
  </>;
}

function handleOnChange(f: React.Dispatch<React.SetStateAction<number>>) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;

    f(v);
  };
}