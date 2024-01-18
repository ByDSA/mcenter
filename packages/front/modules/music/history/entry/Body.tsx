import { BACKEND_URLS } from "#modules/urls";
import { secsToMmss } from "#modules/utils/dates";
import { InputResourceProps, ResourceInput, ResourceInputArrayString } from "#modules/utils/elements";
import { getDiff } from "#modules/utils/objects";
import { JSX, useState } from "react";
import { HistoryMusicEntry, MusicPatchOneByIdReq, MusicVO } from "#shared/models/musics";
import { PropInfo } from "#shared/utils/validation/zod";
import { fetchPatch } from "../../requests";
import LastestComponent from "./Lastest";
import style from "./style.module.css";
import { MUSIC_PROPS } from "./utils";

function generateBody(entryResource: MusicVO, resource: MusicVO) {
  const patchBodyParams: MusicPatchOneByIdReq["body"] = getDiff(entryResource, resource);

  return patchBodyParams;
}

type Props = {
  entry: Required<HistoryMusicEntry>;
  resourceState: [MusicVO, React.Dispatch<React.SetStateAction<MusicVO>>];
  initialResource: MusicVO;
  isModified: boolean;
  errors?: Record<keyof MusicVO, string>;
};
export default function Body( {entry, initialResource, resourceState, isModified, errors}: Props) {
  const [resource, setResource] = resourceState;
  const reset = () => {
    setResource(entry.resource);
  };
  const update = () => {
    const id = entry.resourceId;
    const patchBodyParams = generateBody(entry.resource, resource);

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
  let titleArtist: JSX.Element;
  const titleElement = <ResourceInput caption={MUSIC_PROPS.title.caption} prop="title" resourceState={resourceState} error={errors?.title}/>;
  const artistElement = <ResourceInput caption={MUSIC_PROPS.artist.caption} prop="artist" resourceState={resourceState} error={errors?.artist}/>;
  const maxLength = 10;

  if (initialResource.title.length < maxLength && initialResource.artist.length < maxLength) {
    titleArtist = <span className={`${style.line1half}` }>
      <span className={style.column2}>
        {titleElement}
        {artistElement}
      </span>
    </span>;
  } else {
    titleArtist = <>
      <span className={style.line1half}>
        {titleElement}
      </span>
      <span className={style.line1half}>
        {artistElement}
      </span>
    </>;
  }

  return <div className={style.dropdown}>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}
    <span className={`${style.line1half} ${style.weight}`}
      style={{
        alignItems: "center",
      }}
    >
      <ResourceInput style={{
        width: "auto",
        minWidth: "calc(100% / 4)",
      }}
      caption={MUSIC_PROPS.weight.caption}
      type="number"
      prop="weight"
      resourceState={resourceState}/>
      <span>{MUSIC_PROPS.tags.caption}</span>
      <ResourceInputArrayString prop="tags" resourceState={resourceState}/>
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
