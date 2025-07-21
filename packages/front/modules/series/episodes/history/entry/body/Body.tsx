import { isDefined } from "$shared/utils/validation";
import { EpisodeFileInfo } from "$shared/models/episodes/file-info";
import { EpisodeHistoryEntryEntity } from "#modules/series/episodes/history/models";
import { LinkAsyncAction, ResourceInputArrayString, ResourceInputNumber, ResourceInputText } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { useHistoryEntryEdition } from "#modules/history";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { EpisodeFileInfoFetching } from "#modules/series/episodes/file-info/requests";
import { generatePatchBody } from "#modules/fetching";
import { EPISODE_FILE_INFO_PROPS, EPISODE_PROPS } from "../utils";
import { EpisodeHistoryEntryFetching } from "../../requests";
import { EpisodeFetching } from "../../../requests";
import style from "./style.module.css";
import { LastestComponent } from "./Lastest";

type Data = EpisodeHistoryEntryFetching.GetMany.Data;

function getAndUpdateEpisodeByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getValue" | "name" | "setResource"> {
  return {
    setResource: (v, r) => ( {
      ...r,
      episode: {
        ...r.episode,
        [prop]: v,
      },
    } ),
    getValue: (r)=>r.episode[prop],
    name: prop,
  };
}
function getAndUpdateFileInfoByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getValue" | "name" | "setResource"> {
  return {
    setResource: (v, r) => ( {
      ...r,
      episode: {
        ...r.episode,
        fileInfos: [{
          ...r.episode.fileInfos[0],
          [prop]: v,
        },
        ...r.episode.fileInfos.slice(1)],
      },
    } ),
    getValue: (r)=>r.episode.fileInfos[0][prop],
    name: prop,
  };
}

type Props = {
  data: Data;
};
export function Body( { data }: Props) {
  const { state, remove, isModified, reset, update } = useHistoryEntryEdition<
Data
  >( {
    data,
    isModifiedFn: calcIsModified,
    fetchRemove: async ()=> {
      const res = await EpisodeHistoryEntryFetching.Delete.fetch(data.id);

      return res.data as Data;
    },
    fetchUpdate: async () => {
      const episodeBody = generatePatchBody(
        data.episode,
        state[0].episode,
        ["title", "weight", "disabled", "tags"],
      );
      const promises: Promise<any>[] = [];

      if (Object.entries(episodeBody.entity).length > 0) {
        const p1 = EpisodeFetching.Patch.fetch(data.episodeCompKey, episodeBody);

        promises.push(p1);
      }

      const dataFileInfo = data.episode.fileInfos[0];
      const stateFileInfo = state[0].episode.fileInfos[0];
      const fileInfoBody = generatePatchBody(
        dataFileInfo,
        stateFileInfo,
        ["end", "path", "start"],
      );

      if (Object.entries(fileInfoBody.entity).length > 0) {
        const p2 = EpisodeFileInfoFetching.Patch.fetch(stateFileInfo.id, fileInfoBody);

        promises.push(p2);
      }

      await Promise.all(promises);
    },
  } );
  const commonEpisodeInputTextProps = {
    inputTextProps: {
      onPressEnter: ()=>update.action(),
    },
    resourceState: state,
  };
  const commonInputNumberProps = {
    inputNumberProps: {
      onPressEnter: ()=>update.action(),
    },
    resourceState: state,
  };
  const titleElement = ResourceInputText( {
    caption: EPISODE_PROPS.title.caption,
    ...getAndUpdateEpisodeByProp("title"),
    ...commonEpisodeInputTextProps,

  } );
  const titleArtist = <span className={classes("line", "height2")}>
    {titleElement}
  </span>;
  const { episode } = state[0];
  const fileInfo = episode.fileInfos[0];
  const { duration } = fileInfo.mediaInfo;

  return <div className={style.container}>
    {titleArtist}

    <span className={`${"line"}`}>
      <span className={classes("height2", style.weight)}>
        {ResourceInputNumber( {
          caption: EPISODE_PROPS.weight.caption,
          ...getAndUpdateEpisodeByProp<number>("weight"),
          ...commonInputNumberProps,
        } )}
      </span>
    </span>
    <span className={classes("line", style.startEnd)}>
      <span className={classes("height2", style.start)}>
        {ResourceInputNumber( {
          caption: EPISODE_FILE_INFO_PROPS.start.caption,
          ...getAndUpdateFileInfoByProp<number>("start"),
          ...commonEpisodeInputTextProps,
        } )}
        <span>
          {fileInfo.start && fileInfo.start > 0 ? secsToMmss(fileInfo.start) : "-"}
        </span>
      </span>
      <span className={classes("height2", style.end)}>
        {ResourceInputNumber( {
          caption: EPISODE_FILE_INFO_PROPS.end.caption,
          ...getAndUpdateFileInfoByProp<number>("end"),
          ...commonEpisodeInputTextProps,
        } )}
        <span>
          {fileInfo.end && fileInfo.end > 0 ? secsToMmss(fileInfo.end) : "-"}
        </span>
      </span>
    </span>
    <span className={classes("line", "height2", style.duration)}>
      <span>Duration:</span><span>{(isDefined(duration) && <>{secsToMmss(duration)} ({duration} s)</>) || "-"}</span>
    </span>
    <span className={classes("line", "height2", style.tags)}>
      <span>{EPISODE_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        ...getAndUpdateEpisodeByProp("tags"),
        resourceState: state,
        inputTextProps: {
          onEmptyPressEnter: commonEpisodeInputTextProps.inputTextProps.onPressEnter,
        },
      } )}
    </span>
    <span className={classes("line", "height2")}>
      {ResourceInputText( {
        caption: EPISODE_FILE_INFO_PROPS.path.caption,
        ...getAndUpdateFileInfoByProp<string>("path"),
        ...commonEpisodeInputTextProps,
      } )}
    </span>
    <span className={classes("line", "height2", style.url)}>
      <span>
    Url:</span><a href={fullUrlOf(fileInfo)}>{fullUrlOf(fileInfo)}</a>
    </span>

    <span className={"break"} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span className={style.update}>{
        <LinkAsyncAction action={update.action as ()=> Promise<void>}
          isDoing={update.isDoing}>Update</LinkAsyncAction>}</span>
      }</span>
    <span className={"break"} />
    {
      remove
    && <>
      <span className={"line"}>
        <LinkAsyncAction
          action={remove.action as ()=> Promise<void>}
          isDoing={remove.isDoing}>Borrar</LinkAsyncAction>
      </span>
      <span className={"break"} />
    </>
    }
    <LastestComponent resourceId={episode.compKey} timestamp={state[0].date.timestamp}/>
  </div>;
}

function fullUrlOf(resource: EpisodeFileInfo) {
  return backendUrl(`/raw/${resource.path}`);
}

function calcIsModified(r1: EpisodeHistoryEntryEntity, r2: EpisodeHistoryEntryEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
  } );
}
