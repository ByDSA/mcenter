import { BACKEND_URLS } from "#modules/urls";
import { secsToMmss } from "#modules/utils/dates";
import { getDiff } from "#modules/utils/objects";
import { HistoryMusicEntry, MusicPatchOneByIdReq, MusicVO } from "#shared/models/musics";
import { PropInfo } from "#shared/utils/validation/zod";
import { InputResourceProps, LinkAsyncAction, ResourceInput, ResourceInputArrayString, useAsyncAction } from "#uikit/input";
import { JSX, useState } from "react";
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
  isBodyVisible: boolean;
};
export default function Body( {isBodyVisible, entry, initialResource, resourceState, isModified, errors}: Props) {
  const asyncUpdateAction = useAsyncAction();
  const [resource, setResource] = resourceState;
  const reset = () => {
    setResource(entry.resource);
  };
  // eslint-disable-next-line require-await
  const update = async () => {
    if (!isModified)
      return;

    const {done, start} = asyncUpdateAction;

    start();
    const id = entry.resourceId;
    const patchBodyParams = generateBody(entry.resource, resource);

    // eslint-disable-next-line consistent-return
    return fetchPatch(id, patchBodyParams)
      .then(() => {
      // eslint-disable-next-line no-param-reassign
        entry.resource = resource;
      } )
      .then(()=>done());
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
  const commonInputProps = {
    inputTextProps: {
      onPressEnter: ()=>update(),
    },
    resourceState,
  };
  const titleElement = ResourceInput( {
    caption: MUSIC_PROPS.title.caption,
    prop:"title",
    error: errors?.title,
    ...commonInputProps,
  } );
  const artistElement = ResourceInput( {
    caption: MUSIC_PROPS.artist.caption,
    prop:"artist",
    error: errors?.artist,
    ...commonInputProps,
  } );
  const maxLength = 22;

  if (initialResource.title.length <= maxLength && initialResource.artist.length <= maxLength) {
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

  return <div className={style.dropdown} style={
    {
      display: isBodyVisible ? "block" : "none",
    }
  }>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}
    <span className={`${style.line1half} ${style.weight}`}
      style={{
        alignItems: "center",
      }}
    >
      {ResourceInput( {
        style:{
          width: "auto",
          minWidth: "calc(100% / 4)",
        },
        caption: MUSIC_PROPS.weight.caption,
        type: "number",
        prop: "weight",
        ...commonInputProps,
      } )}
      <span>{MUSIC_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        prop: "tags",
        resourceState,
        inputTextProps: {
          onEmptyPressEnter: commonInputProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={style.line1half}>
      {ResourceInput( {
        caption:MUSIC_PROPS.album.caption,
        prop:"album",
        ...commonInputProps,
      } )}
    </span>
    <span className={style.line1half}>
      {ResourceInput( {
        caption:MUSIC_PROPS.path.caption,
        prop:"path",
        ...commonInputProps,
      } )}
    </span>
    <span className={style.line1half}>
      {ResourceInput( {
        caption: <><a href={fullUrlOf(resource.url)}>url</a>:</>,
        prop:"url",
        ...commonInputProps,
      } )}
    </span>
    {(resource.mediaInfo.duration && resource.mediaInfo.duration > 0 && <>
      <span className="line">Duration : {secsToMmss(resource.mediaInfo.duration)}</span>
    </>) || null}
    {OptionalProps( {
      optionalProps,
      errors,
      ...commonInputProps,
    } )}

    <span className={style.break} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span style={{
        marginLeft: "1em",
      }}>{<LinkAsyncAction action={update} isDoing={asyncUpdateAction.isDoing}>Update</LinkAsyncAction>}</span>}</span>
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
