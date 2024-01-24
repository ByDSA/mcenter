import { secsToMmss } from "#modules/utils/dates";
import { getDiff, isModified as isModifiedd } from "#modules/utils/objects";
import { HistoryMusicEntry, MusicPatchOneByIdReq, MusicVO, assertIsMusicVO } from "#shared/models/musics";
import { assertIsDefined } from "#shared/utils/validation";
import { PropInfo } from "#shared/utils/validation/zod";
import { InputResourceProps, LinkAsyncAction, ResourceInput, ResourceInputArrayString, useAsyncAction } from "#uikit/input";
import React, { JSX, useEffect, useState } from "react";
import { fetchPatch as fetchMusicPatch, backendUrls as musicBackendUrls } from "../../../requests";
import { MUSIC_PROPS } from "../utils";
import LastestComponent from "./Lastest";
import style from "./style.module.css";

function generateBody(entryResource: MusicVO, resource: MusicVO) {
  const patchBodyParams: MusicPatchOneByIdReq["body"] = getDiff(entryResource, resource);

  return patchBodyParams;
}

type Props = {
  entry: Required<HistoryMusicEntry>;
  isBodyVisible: boolean;
};
export default function Body( {isBodyVisible, entry}: Props) {
  const resourceBase = useResourceBase(entry, calcIsModified);
  const resourceState = useState( {
    ...resourceBase,
    // eslint-disable-next-line no-unsafe-optional-chaining
    tags: [...(resourceBase?.tags ?? [])],
  } as MusicVO);
  const [resource, setResource] = resourceState;
  const isModified = useIsModified(resourceBase, resource, calcIsModified);
  const asyncUpdateAction = useAsyncAction();
  const reset = () => {
    setResource(entry.resource);
  };
  const {errors} = useValidation(resource);
  // eslint-disable-next-line require-await
  const update = async () => {
    if (!isModified)
      return;

    const {done, start} = asyncUpdateAction;

    start();
    const id = entry.resourceId;
    const patchBodyParams = generateBody(entry.resource, resource);

    // eslint-disable-next-line consistent-return
    return fetchMusicPatch(id, patchBodyParams)
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
  const titleArtist = <span className={style.line}>
    <span className={`${style.height1half} ${style.title}`}>
      {titleElement}
    </span>
    <span className={`${style.height1half} ${style.artist}`}>
      {artistElement}
    </span>
  </span>;

  return <div className={style.container} style={
    {
      display: isBodyVisible ? "block" : "none",
    }
  }>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}

    <span className={`${style.line}`}>
      <span className={`${style.height1half} ${style.weight}`}>
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
      <span className={`${style.height1half} ${style.album}`}>
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
    <span className={`${style.line} ${style.height1half} ${style.tags}`}>
      <span>{MUSIC_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        prop: "tags",
        resourceState,
        inputTextProps: {
          onEmptyPressEnter: commonInputProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={`${style.line} ${style.height1half}`}>
      {ResourceInput( {
        caption:MUSIC_PROPS.path.caption,
        prop:"path",
        ...commonInputProps,
      } )}
    </span>
    <span className={`${style.line} ${style.height1half}`}>
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
    <span className={`${style.line} ${style.height1half}`}>
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
        <span className={`${style.line} ${style.height1half}`}>
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

function useValidation<T>(resource: T): {isValid: boolean; errors: Record<keyof T, string>} {
  const [errors, setErrors] = React.useState( {
  } as Record<keyof T, string>);

  useEffect(() => {
    try {
      assertIsMusicVO(resource, {
        useZodError: true,
      } );
    } catch (e) {
      if (e.name !== "ZodError")
        throw e;

      setErrors(parseErrors(e) as Record<keyof T, string>);
    }
  }, [resource]);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

type ZodIssue = {
    "code": string;
    "expected": string;
    "received": string;
    "path": string[];
    "message": string;
  };

  type ZodError = {
    issues: ZodIssue[];
  };
function parseErrors(e: ZodError): Record<string, string> {
  const errors: {} = {
  };
  const {issues} = e;

  for (const issue of issues) {
    const path = issue.path[0];
    const {message} = issue;

    errors[path] = message;
  }

  return errors;
}

type CompareFn<T> = (r1: T, r2: T)=> boolean;
function useResourceBase(entry: HistoryMusicEntry, compare: CompareFn<MusicVO>) {
  const entryResource = entry.resource;

  assertIsDefined(entryResource);
  const [resourceBase, setResourceBase] = React.useState(entryResource);

  useEffect(() => {
    if (compare(entryResource, resourceBase))
      setResourceBase(entryResource);
  }, [entry, entryResource]);

  return resourceBase;
}

function useIsModified<T>(base: T, current: T, compare: CompareFn<T>) {
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const v = compare(base, current);

    setIsModified(v);
  }, [base, current]);

  return isModified;
}

function calcIsModified(r1: MusicVO, r2: MusicVO) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}