import { getBackendUrl } from "#modules/utils";
import { secsToMmss } from "#modules/utils/dates";
import { HistoryMusicEntry } from "#shared/models/musics";
import LastestComponent from "./Lastest";
import Tag from "./Tag";
import style from "./style.module.css";

type Props = {
  resource: Required<HistoryMusicEntry>["resource"];
  resourceId: string;
  weightState: [number, React.Dispatch<React.SetStateAction<number>>];
};
export default function Body( {resource, resourceId, weightState}: Props) {
  const [weight, setWeight] = weightState;
  const reset = () => {
    setWeight(resource.weight);
  };

  return <div className={style.dropdown}>
    <span className={`${style.line1half}` }>
      <span className={style.column2}>
        <span>Título: {resource.title}</span>
        <span>Artista: {resource.artist}</span>
      </span>
    </span>
    {resource.game && <>
      <span className={style.line1half}>Game: {resource.game}</span>
    </>}
    {resource.country && <>
      <span className={style.line1half}>Country: {resource.country}</span>
    </>}
    <span className={`${style.line1half} ${style.weight}`}>
      <span>Weight:</span> <input type="number" value={weight} onChange={handleOnChange(setWeight)}/>
    </span>
    <span className={style.line1half}>url: <a href={fullUrlOf(resource.url)}>{resource.url}</a></span>
    {(resource.mediaInfo.duration && resource.mediaInfo.duration > 0 && <>
      <span className="line">Duration : {secsToMmss(resource.mediaInfo.duration)}</span>
    </>) || null}
    <span className="line">Tags: {resource.tags?.map(t=>(<Tag key={t} name={t}/>))}</span>
    <span className={style.break} />
    <span className="line"><a onClick={() => reset()}>Reset</a></span>
    <span className={style.break} />
    <span className={style.break} />
    <LastestComponent resourceId={resourceId} />
  </div>;
}

function fullUrlOf(url: string) {
  return `${getBackendUrl()}/api/musics/get/raw/${ url}`;
}

function handleOnChange(f: React.Dispatch<React.SetStateAction<number>>) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = +e.target.value;

    f(v);
  };
}