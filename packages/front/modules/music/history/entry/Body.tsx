import { BACKEND_URLS } from "#modules/urls";
import { secsToMmss } from "#modules/utils/dates";
import { InputResourceProps, ResourceInput } from "#modules/utils/elements";
import { getDiff } from "#modules/utils/objects";
import { HistoryMusicEntry, MusicPatchOneByIdReq, MusicVO } from "#shared/models/musics";
import { PropInfo } from "#shared/utils/validation/zod";
import { JSX, useState } from "react";
import { fetchPatch } from "../../requests";
import LastestComponent from "./Lastest";
import Tag from "./Tag";
import style from "./style.module.css";
import { MUSIC_PROPS } from "./utils";

type Props = {
  entry: Required<HistoryMusicEntry>;
  resourceState: [MusicVO, React.Dispatch<React.SetStateAction<MusicVO>>];
  isModified: boolean;
  errors?: Record<keyof MusicVO, string>;
};
export default function Body( {entry, resourceState, isModified, errors}: Props) {
  const [resource, setResource] = resourceState;
  const reset = () => {
    setResource(entry.resource);
  };
  const update = () => {
    const partial = getDiff(entry.resource, resource);
    const id = entry.resourceId;
    const unset = Object.entries(partial).filter(([_, value]) => value === undefined)
      .map(([key]) => key);
    const patchBodyParams: MusicPatchOneByIdReq["body"] = {
      unset: unset.length > 0 ? unset : undefined,
      entity: partial,
    };

    fetchPatch(id, patchBodyParams).then(() => {
      // eslint-disable-next-line no-param-reassign
      entry.resource = resource;
    } );
  };
  const optionalProps: Record<keyof MusicVO, PropInfo> = Object.entries(MUSIC_PROPS).reduce((acc, [key, value]) => {
    if (value.required)
      return acc;

    if (["lastTimePlayed", "album", "tags"].includes(key))
      return acc;

    acc[key as keyof MusicVO] = value;

    return acc;
  }, {
  } as Record<keyof MusicVO, PropInfo>);

  return <div className={style.dropdown}>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    <span className={`${style.line1half}` }>
      <span className={style.column2}>
        <ResourceInput caption={MUSIC_PROPS.title.caption} prop="title" resourceState={resourceState} error={errors?.title}/>
        <ResourceInput caption={MUSIC_PROPS.artist.caption} prop="artist" resourceState={resourceState} error={errors?.artist}/>
      </span>
    </span>
    <span className={`${style.line1half} ${style.weight}`}
      style={{
        alignItems: "center",
      }}
    >
      <ResourceInput width="auto" caption={MUSIC_PROPS.weight.caption} prop="weight" resourceState={resourceState}/>
      <span>Tags:</span>
      <span style= {{
        marginLeft: "1em",
      }}>{resource.tags?.map((t,i)=>(<Tag key={t + i} name={t}/>))}</span>
    </span>
    <span className={style.line1half}>
      <ResourceInput caption={MUSIC_PROPS.album.caption} prop="album" resourceState={resourceState}/>
    </span>
    <span className={style.line1half}>
      <ResourceInput caption={MUSIC_PROPS.path.caption} prop="path" resourceState={resourceState}/>
    </span>
    <span className={style.line1half}>
      <ResourceInput caption={<><a href={fullUrlOf(resource.url)}>url</a>:</>} prop="url" resourceState={resourceState}/>
    </span>
    {(resource.mediaInfo.duration && resource.mediaInfo.duration > 0 && <>
      <span className="line">Duration : {secsToMmss(resource.mediaInfo.duration)}</span>
    </>) || null}
    <OptionalProps resourceState={resourceState} optionalProps={optionalProps} errors={errors}/>

    <span className={style.break} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span style={{
        marginLeft: "1em",
      }}><a href="#" onClick={() => update()}>Update</a></span>}</span>
    <span className={style.break} />
    <LastestComponent resourceId={entry.resourceId} date={entry.date}/>
  </div>;
}

type OptionalPropsProps = Omit<InputResourceProps<MusicVO>, "prop"> & {
  optionalProps: Record<keyof MusicVO, PropInfo>;
  errors?: Record<keyof MusicVO, string>;
};
function OptionalProps( {resourceState, optionalProps, errors}: OptionalPropsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ret: Record<string, JSX.Element> = {
  };

  ret.top = (<>
    <span className={style.line1half}>
      <a onClick={() => setIsVisible(!isVisible)}>{!isVisible ? "Mostrar" : "Ocultar"} todas las propiedades opcionales</a>
    </span>
  </>);

  const [resource] = resourceState;
  const entries = Object.entries(optionalProps) as [keyof MusicVO, PropInfo][];

  for (const entry of entries) {
    const prop = entry[0];
    const propInfo = entry[1];
    const {type, caption = prop} = propInfo;

    if (prop in resource || isVisible) {
      ret[prop] = (<>
        <span className={style.line1half}>
          <ResourceInput caption={caption} type={type === "number" ? "number" : "string"} prop={prop} resourceState={resourceState} isOptional error={errors?.[prop]}/>
        </span>
      </>);
    }
  }

  return <>
    {Object.entries(ret).map(([key, value]) => <span key={key}>{value}</span>)}
  </>;
}

function fullUrlOf(url: string) {
  return BACKEND_URLS.resources.musics.raw( {
    url,
  } );
}
