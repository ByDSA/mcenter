import { secsToMmss } from "#modules/utils/dates";
import { getDiff, isModified as isModifiedd } from "#modules/utils/objects";
import { useResourceEdition } from "#modules/utils/resources";
import { classes } from "#modules/utils/styles";
import { HistoryMusicEntry, MusicPatchOneByIdReq, MusicVO, assertIsMusicVO } from "#shared/models/musics";
import { PropInfo } from "#shared/utils/validation/zod";
import { InputResourceProps, LinkAsyncAction, ResourceInput, ResourceInputArrayString } from "#uikit/input";
import { JSX, useState } from "react";
import { fetchPatch, backendUrls as musicBackendUrls } from "../../../requests";
import { MUSIC_PROPS } from "../utils";
import LastestComponent from "./Lastest";
import style from "./style.module.css";

function generatePatchBody(entryResource: MusicVO, resource: MusicVO) {
  const patchBodyParams: MusicPatchOneByIdReq["body"] = getDiff(entryResource, resource);

  return patchBodyParams;
}

type Props = {
  entry: Required<HistoryMusicEntry>;
};
export default function Body( {entry}: Props) {
  const {isModified, update:{action: update, isDoing: isUpdating}, errors, resourceState, reset} = useResourceEdition( {
    calcIsModified,
    entry,
    assertionFn: assertIsMusicVO,
    fetching: {
      patch: {
        fetch: fetchPatch,
        generateBody: generatePatchBody,
      },
    },
  } );
  const [resource] = resourceState;
  // eslint-disable-next-line require-await
  const optionalProps: Record<keyof MusicVO, PropInfo> = Object.entries(MUSIC_PROPS).reduce((acc, [key, value]) => {
    if (value.required)
      return acc;

    if (["lastTimePlayed", "album", "tags"].includes(key))
      return acc;

    acc[key as keyof MusicVO] = value;

    return acc;
  }, {
  } as Record<keyof MusicVO, PropInfo>);
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
  const titleArtist = <span className={"line"}>
    <span className={`${"height2"} ${style.title}`}>
      {titleElement}
    </span>
    <span className={`${"height2"} ${style.artist}`}>
      {artistElement}
    </span>
  </span>;

  return <div className={style.container}>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}

    <span className={`${"line"}`}>
      <span className={classes("height2", style.weight)}>
        {ResourceInput( {
          style:{
            width: "150px",
          },
          caption: MUSIC_PROPS.weight.caption,
          type: "number",
          prop: "weight",
          ...commonInputProps,
        } )}
      </span>
      <span className={classes("height2", style.album)}>
        {ResourceInput( {
          style: {
            minWidth: "250px",
            width: "100%",
            marginBottom: "0",
          },
          caption:MUSIC_PROPS.album.caption,
          prop:"album",
          ...commonInputProps,
        } )}
      </span>
    </span>
    <span className={classes("line", "height2")}>
      <span className={style.tags}>
        <span>{MUSIC_PROPS.tags.caption}</span>
        {ResourceInputArrayString( {
          prop: "tags",
          resourceState,
          inputTextProps: {
            onEmptyPressEnter: commonInputProps.inputTextProps.onPressEnter,
          },
        } )}
      </span>
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInput( {
        caption:MUSIC_PROPS.path.caption,
        prop:"path",
        ...commonInputProps,
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInput( {
        caption: <><a href={fullUrlOf(resource.url)}>Url</a>:</>,
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

    <span className={"break"} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span style={{
        marginLeft: "1em",
      }}>{<LinkAsyncAction action={update} isDoing={isUpdating}>Update</LinkAsyncAction>}</span>}</span>
    <span className={"break"} />
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
    <span className={classes("line", "height2")}>
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
        <span className={classes("line", "height2")}>
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
  return musicBackendUrls.raw( {
    url,
  } );
}

function calcIsModified(r1: MusicVO, r2: MusicVO) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}