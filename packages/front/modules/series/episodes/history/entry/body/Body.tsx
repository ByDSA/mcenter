import { useHistoryEntryEdition } from "#modules/history";
import { rootBackendUrl } from "#modules/requests";
import { secsToMmss } from "#modules/utils/dates";
import { getDiff, isModified as isModifiedd } from "#modules/utils/objects";
import { classes } from "#modules/utils/styles";
import { Episode, EpisodePatchOneByIdRequest, assertIsEpisode } from "#shared/models/episodes";
import { HistoryEntryWithId } from "#shared/models/historyLists";
import { assertIsDefined, isDefined } from "#shared/utils/validation";
import { LinkAsyncAction, ResourceInput, ResourceInputArrayString } from "#uikit/input";
import { fetchPatch } from "../../../requests";
import { fetchDelete } from "../../requests";
import { EPISODE_PROPS } from "../utils";
import LastestComponent from "./Lastest";
import style from "./style.module.css";

function generatePatchBody(entryResource: Episode, resource: Episode) {
  const patchBodyParams: EpisodePatchOneByIdRequest["body"] = getDiff(entryResource, resource);

  return patchBodyParams;
}

type Props = {
  entry: HistoryEntryWithId;
};
export default function Body( {entry: entryEpisode}: Props) {
  const {episodeId: resourceId, episode: r, ...restEntryEpisode} = entryEpisode;
  const entry = { // TODO: modificar HistoryEntry para que sea 'resource' y no 'episode' y poder quitar esto
    ...restEntryEpisode,
    resourceId,
    resource: r,
  };

  assertIsDefined(entry.resource, "entry.resource");
  const {resource: resourceRet, delete: deleteEntry} = useHistoryEntryEdition( {
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
  const {isModified, update:{action: update, isDoing: isUpdating}, errors, resourceState, reset} = resourceRet;
  const [resource] = resourceState;
  // eslint-disable-next-line require-await
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
    prop:"title",
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
        caption:EPISODE_PROPS.path.caption,
        prop:"path",
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
      {isModified && <span className={style.update}>{<LinkAsyncAction action={update} isDoing={isUpdating}>Update</LinkAsyncAction>}</span>}</span>
    <span className={"break"} />
    {
      deleteEntry &&
    <>
      <span className={"line"}>
        <LinkAsyncAction action={deleteEntry.action} isDoing={deleteEntry.isDoing}>Borrar</LinkAsyncAction>
      </span>
      <span className={"break"} />
    </>
    }
    <LastestComponent resourceId={entry.resource.id} date={entry.date}/>
  </div>;
}

function fullUrlOf(resource: Episode) {
  return `${rootBackendUrl}/raw/${resource.path}`;
}

function calcIsModified(r1: Episode, r2: Episode) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}