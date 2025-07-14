import { z } from "zod";
import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { EpisodeHistoryEntryEntity } from "#modules/series/episodes/history/models";
import { patchOneById } from "#modules/series/episodes/models/dto";
import { Episode, assertIsEpisode } from "#modules/series/episodes/models";
import { LinkAsyncAction, ResourceInput, ResourceInputArrayString } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { getDiff, isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { useHistoryEntryEdition } from "#modules/history";
import { EPISODE_PROPS } from "../utils";
import { fetchDelete } from "../../requests";
import { fetchPatch } from "../../../requests";
import style from "./style.module.css";
import { LastestComponent } from "./Lastest";

function generatePatchBody(entryResource: Episode, resource: Episode) {
  const patchBodyParams = getDiff(
    entryResource,
    resource,
  ) as z.infer<typeof patchOneById.reqBodySchema>;

  return patchBodyParams;
}

type Props = {
  entry: EpisodeHistoryEntryEntity;
};
export function Body( { entry: entryEpisode }: Props) {
  const { episodeId: resourceId, episode: r, ...restEntryEpisode } = entryEpisode;
  // TODO: modificar EpisodeHistoryEntry para que sea 'resource' y no 'episode' y poder quitar esto
  const entry = {
    ...restEntryEpisode,
    resourceId,
    resource: r,
    id: restEntryEpisode.date.timestamp,
  };

  assertIsDefined(entry.resource, "entry.resource");
  const { resource: resourceRet, delete: deleteEntry } = useHistoryEntryEdition( {
    resource: {
      calcIsModified,
      entry,
      assertionFn: assertIsEpisode,
      fetching: {
        patch: {
          fetch: fetchPatch,
          generateBody: generatePatchBody,
        },
      },
    },
    delete: {
      fetch: fetchDelete,
    },
  } );
  const { isModified,
    update: { action: update, isDoing: isUpdating },
    errors,
    resourceState,
    reset } = resourceRet;
  const [resource] = resourceState;
  const commonInputTextProps = {
    inputTextProps: {
      onPressEnter: ()=>update(),
    },
    resourceState,
  };
  const commonInputNumberProps = {
    inputNumberProps: {
      onPressEnter: ()=>update(),
    },
    resourceState,
  };
  const titleElement = ResourceInput( {
    caption: EPISODE_PROPS.title.caption,
    prop: "title",
    error: errors?.title,
    ...commonInputTextProps,
  } );
  const titleArtist = <span className={classes("line", "height2")}>
    {titleElement}
  </span>;
  const duration = resource.fileInfo?.mediaInfo.duration;

  return <div className={style.container}>
    {errors && Object.entries(errors).length > 0 && Object.entries(errors).map(([key, value]) => <span key={key} className="line">{key}: {value}</span>)}
    {titleArtist}

    <span className={`${"line"}`}>
      <span className={classes("height2", style.weight)}>
        {ResourceInput( {
          caption: EPISODE_PROPS.weight.caption,
          type: "number",
          prop: "weight",
          ...commonInputNumberProps,
        } )}
      </span>
    </span>
    <span className={classes("line", style.startEnd)}>
      <span className={classes("height2", style.start)}>
        {ResourceInput( {
          caption: EPISODE_PROPS.start.caption,
          type: "number",
          prop: "start",
          ...commonInputTextProps,
        } )}
        <span>
          {resource.start && resource.start > 0 ? secsToMmss(resource.start) : "-"}
        </span>
      </span>
      <span className={classes("height2", style.end)}>
        {ResourceInput( {
          caption: EPISODE_PROPS.end.caption,
          type: "number",
          prop: "end",
          ...commonInputTextProps,
        } )}
        <span>
          {resource.end && resource.end > 0 ? secsToMmss(resource.end) : "-"}
        </span>
      </span>
    </span>
    <span className={classes("line", "height2", style.duration)}>
      <span>Duration:</span><span>{(isDefined(duration) && <>{secsToMmss(duration)} ({duration} s)</>) || "-"}</span>
    </span>
    <span className={classes("line", "height2", style.tags)}>
      <span>{EPISODE_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        prop: "tags",
        resourceState,
        inputTextProps: {
          onEmptyPressEnter: commonInputTextProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInput( {
        caption: EPISODE_PROPS.path.caption,
        prop: "path",
        ...commonInputTextProps,
      } )}
    </span>
    <span className={classes("line", "height2", style.url)}>
      <span>
    Url:</span><a href={fullUrlOf(resource)}>{fullUrlOf(resource)}</a>
    </span>

    <span className={"break"} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span className={style.update}>{
        <LinkAsyncAction action={update} isDoing={isUpdating}>Update</LinkAsyncAction>}</span>
      }</span>
    <span className={"break"} />
    {
      deleteEntry
    && <>
      <span className={"line"}>
        <LinkAsyncAction
          action={deleteEntry.action}
          isDoing={deleteEntry.isDoing}>Borrar</LinkAsyncAction>
      </span>
      <span className={"break"} />
    </>
    }
    <LastestComponent resourceId={entry.resource.id} date={entry.date}/>
  </div>;
}

function fullUrlOf(resource: Episode) {
  return backendUrl(`/raw/${resource.path}`);
}

function calcIsModified(r1: Episode, r2: Episode) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}
