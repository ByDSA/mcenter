import { rootBackendUrl } from "#modules/requests";
import { getDiff, isModified as isModifiedd } from "#modules/utils/objects";
import { classes } from "#modules/utils/styles";
import { Episode, EpisodePatchOneByIdRequest, assertIsEpisode } from "#shared/models/episodes";
import { HistoryEntryWithId } from "#shared/models/historyLists";
import { assertIsDefined, isDefined } from "#shared/utils/validation";
import { LinkAsyncAction, ResourceInput, ResourceInputArrayString, useAsyncAction } from "#uikit/input";
import React, { useEffect, useState } from "react";
import { fetchPatch as fetchEpisodePatch } from "../../../requests";
import { fetchDelete as fetchHistoryEntryDelete } from "../../requests";
import { EPISODE_PROPS } from "../utils";
import LastestComponent from "./Lastest";
import style from "./style.module.css";

function generateBody(entryResource: Episode, resource: Episode) {
  const patchBodyParams: EpisodePatchOneByIdRequest["body"] = getDiff(entryResource, resource);

  return patchBodyParams;
}

type Props = {
  entry: HistoryEntryWithId;
  isBodyVisible: boolean;
};
export default function Body( {isBodyVisible, entry}: Props) {
  const resourceBase = useResourceBase(entry, calcIsModified);
  const resourceState = useState( {
    ...resourceBase,
    // eslint-disable-next-line no-unsafe-optional-chaining
    tags: resourceBase?.tags ? [...resourceBase.tags] : undefined,
  } as Episode);
  const [resource, setResource] = resourceState;
  const isModified = useIsModified(resourceBase, resource, calcIsModified);
  const asyncUpdateAction = useAsyncAction();
  const asyncRemoveAction = useAsyncAction();
  const reset = () => {
    assertIsDefined(entry.episode);
    setResource(entry.episode);
  };
  const {errors} = useValidation(resource);
  // eslint-disable-next-line require-await
  const update = async () => {
    if (!isModified)
      return;

    const {done, start} = asyncUpdateAction;

    start();
    const id = entry.episodeId;

    assertIsDefined(entry.episode);
    const patchBodyParams = generateBody(entry.episode, resource);

    // eslint-disable-next-line consistent-return
    return fetchEpisodePatch(id, patchBodyParams)
      .then(() => {
      // eslint-disable-next-line no-param-reassign
        entry.episode = resource;
      } )
      .then(()=>done());
  };
  // eslint-disable-next-line require-await
  const remove = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Borar esta entrada del historial?\n${ JSON.stringify( {
      serieId: entry.episodeId.serieId,
      episodeId: entry.episodeId.innerId,
      date: entry.date,
    }, null, 2)}`))
      return Promise.resolve();

    const {done, start} = asyncRemoveAction;

    start();
    const historyEntryId = entry.id;
    const {historyListId} = entry;

    return fetchHistoryEntryDelete(historyListId, historyEntryId)
      .then(() => done());
  };
  const commonInputProps = {
    inputTextProps: {
      onPressEnter: ()=>update(),
    },
    resourceState,
  };
  const titleElement = ResourceInput( {
    caption: EPISODE_PROPS.title.caption,
    prop:"title",
    error: errors?.title,
    ...commonInputProps,
  } );
  const titleArtist = <span className={classes(style.line, style.height2)}>
    {titleElement}
  </span>;
  const duration = resource.fileInfo?.mediaInfo.duration;

  return <div className={style.container} style={
    {
      display: isBodyVisible ? "block" : "none",
    }
  }>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}

    <span className={`${style.line}`}>
      <span className={`${style.height2} ${style.weight}`}>
        {ResourceInput( {
          caption: EPISODE_PROPS.weight.caption,
          type: "number",
          prop: "weight",
          ...commonInputProps,
        } )}
      </span>
    </span>
    <span className={classes(style.line, style.startEnd)}>
      <span className={classes(style.height2, style.start)}>
        {ResourceInput( {
          caption: EPISODE_PROPS.start.caption,
          type: "number",
          prop: "start",
          ...commonInputProps,
        } )}
        <span>
          {resource.start && resource.start > 0 ? secsToMS(resource.start) : "-"}
        </span>
      </span>
      <span className={classes(style.height2, style.end)}>
        {ResourceInput( {
          caption: EPISODE_PROPS.end.caption,
          type: "number",
          prop: "end",
          ...commonInputProps,
        } )}
        <span>
          {resource.end && resource.end > 0 ? secsToMS(resource.end) : "-"}
        </span>
      </span>
    </span>
    <span className={classes(style.line, style.height2)}>
      <span>Duration : {(isDefined(duration) && <>{secsToMS(duration)} ({duration} s)</>) || "-"}</span>
    </span>
    <span className={`${style.line} ${style.height2} ${style.tags}`}>
      <span>{EPISODE_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        prop: "tags",
        resourceState,
        inputTextProps: {
          onEmptyPressEnter: commonInputProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={`${style.line} ${style.height2}`}>
      {ResourceInput( {
        caption:EPISODE_PROPS.path.caption,
        prop:"path",
        ...commonInputProps,
      } )}
    </span>
    <span className={classes(style.line, style.height2, style.url)}>
      <span>
    Url:</span><a href={fullUrlOf(resource)}>{fullUrlOf(resource)}</a>
    </span>

    <span className={style.break} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span style={{
        marginLeft: "1em",
      }}>{<LinkAsyncAction action={update} isDoing={asyncUpdateAction.isDoing}>Update</LinkAsyncAction>}</span>}</span>
    <span className={style.break} />
    <span className={style.line}>
      <LinkAsyncAction action={remove} isDoing={asyncRemoveAction.isDoing}>Borrar</LinkAsyncAction>
    </span>
    <span className={style.break} />
    <LastestComponent historyEntry={entry}/>
  </div>;
}

function fullUrlOf(resource: Episode) {
  return `${rootBackendUrl}/raw/${resource.path}`;
}

function useValidation<T>(resource: T): {isValid: boolean; errors: Record<keyof T, string>} {
  const [errors, setErrors] = React.useState( {
  } as Record<keyof T, string>);

  useEffect(() => {
    try {
      assertIsEpisode(resource, {
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
function useResourceBase(entry: HistoryEntryWithId, compare: CompareFn<Episode>) {
  const entryResource = entry.episode as Episode;

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

function calcIsModified(r1: Episode, r2: Episode) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}

function secsToMS(secs: number) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  const secondsInt = Math.floor(seconds);
  const secondsDecimal = seconds - secondsInt;

  return `${minutes.toString().padStart(2, "0")}:${secondsInt.toString().padStart(2,"0")}${ secondsDecimal ? secondsDecimal.toFixed(2).substring(1) : ""}`;
}