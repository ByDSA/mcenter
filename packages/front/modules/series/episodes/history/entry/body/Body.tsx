import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeHistoryEntryEntity } from "#modules/series/episodes/history/models";
import { LinkAsyncAction, ResourceInputArrayString, ResourceInputNumber, ResourceInputText } from "#uikit/input";
import { classes } from "#modules/utils/styles";
import { isModified as isModifiedd } from "#modules/utils/objects";
import { secsToMmss } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { useHistoryEntryEdition } from "#modules/history";
import { ResourceInputCommonProps } from "#modules/ui-kit/input/ResourceInputCommonProps";
import { EpisodeFileInfoFetching } from "#modules/series/episodes/file-info/requests";
import { generatePatchBody, shouldSendPatchWithBody } from "#modules/fetching";
import { EpisodeFetching } from "../../../requests";
import { EpisodeHistoryEntryFetching } from "../../requests";
import { EPISODE_FILE_INFO_PROPS, EPISODE_PROPS } from "../utils";
import commonStyle from "../../../../../history/entry/body-common.module.css";
import { LastestComponent } from "./Lastest";
import style from "./style.module.css";

type Data = EpisodeHistoryEntryFetching.GetMany.Data;

function getAndUpdateEpisodeByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getUpdatedResource" | "getValue" | "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      resource: {
        ...r.resource,
        [prop]: v,
      },
    } ),
    getValue: (r)=>r.resource[prop],
    name: prop,
  };
}
function getAndUpdateFileInfoByProp<V>(
  prop: string,
): Pick<ResourceInputCommonProps<Data, V>, "getUpdatedResource" | "getValue" | "name"> {
  return {
    getUpdatedResource: (v, r) => ( {
      ...r,
      resource: {
        ...r.resource,
        fileInfos: [{
          ...r.resource.fileInfos[0],
          [prop]: v,
        },
        ...r.resource.fileInfos.slice(1)],
      },
    } ),
    getValue: (r)=>r.resource.fileInfos[0][prop],
    name: prop,
  };
}

type Props = {
  data: Data;
};
export function Body( { data }: Props) {
  const { state, remove, isModified,
    reset, addOnReset,
    update, initialState } = useHistoryEntryEdition<Data>( {
      data,
      isModifiedFn: calcIsModified,
      fetchRemove: async ()=> {
        const res = await EpisodeHistoryEntryFetching.Delete.fetch(data.id);

        return res.data as Data;
      },
      fetchUpdate: async () => {
        const episodeBody = generatePatchBody(
          data.resource,
          state[0].resource,
          ["title", "weight", "disabled", "tags"],
        );

      type ResEpisode = EpisodeEntity & Required<Pick<EpisodeEntity, "fileInfos">>;
      let episodePromise: Promise<ResEpisode> = Promise.resolve() as Promise<any>;

      if (shouldSendPatchWithBody(episodeBody)) {
        episodePromise = EpisodeFetching.Patch.fetch(data.resourceId, episodeBody)
          .then(res=>{
            const episode: ResEpisode = {
              ...res.data,
              fileInfos: state[0].resource.fileInfos,
            };

            assertIsDefined(episode.fileInfos);

            return episode;
          } );
      }

      const dataFileInfo = data.resource.fileInfos[0];
      const stateFileInfo = state[0].resource.fileInfos[0];
      const fileInfoBody: EpisodeFileInfoFetching.Patch.Body = generatePatchBody(
        dataFileInfo,
        stateFileInfo,
        ["end", "path", "start"],
      );
      let fileInfoPromise: Promise<EpisodeFileInfoEntity> = Promise.resolve() as Promise<any>;

      if (shouldSendPatchWithBody(fileInfoBody)) {
        fileInfoPromise = EpisodeFileInfoFetching.Patch.fetch(stateFileInfo.id, fileInfoBody)
          .then(res=>{
            return res.data;
          } );
      }

      await Promise.all([episodePromise, fileInfoPromise]);

      const newData: Data = {
        ...state[0],
      };

      if (await episodePromise)
        newData.resource = await episodePromise;

      if (await fileInfoPromise)
        newData.resource.fileInfos = [await fileInfoPromise];

      return newData;
      },
    } );
  const commonEpisodeInputProps = {
    onPressEnter: ()=>update.action(),
    resourceState: state,
    originalResource: initialState[0],
    addOnReset,
  };
  const titleElement = ResourceInputText( {
    caption: EPISODE_PROPS.title.caption,
    ...getAndUpdateEpisodeByProp<string>("title"),
    ...commonEpisodeInputProps,

  } );
  const titleArtist = <span className={classes("line", "height2")}>
    {titleElement}
  </span>;
  const { resource } = state[0];
  const fileInfo = resource.fileInfos[0];
  const { duration } = fileInfo.mediaInfo;
  const slug = fullUrlOf(resource);

  return <div className={classes(style.container, commonStyle.container)}>
    {titleArtist}

    <span className={`${"line"}`}>
      <span className={classes("height2", style.weight)}>
        {ResourceInputNumber( {
          caption: EPISODE_PROPS.weight.caption,
          ...getAndUpdateEpisodeByProp<number>("weight"),
          ...commonEpisodeInputProps,
        } )}
      </span>
    </span>
    <span className={classes("line", style.startEnd)}>
      <span className={classes("height2", style.start)}>
        {ResourceInputNumber( {
          caption: EPISODE_FILE_INFO_PROPS.start.caption,
          ...getAndUpdateFileInfoByProp<number>("start"),
          ...commonEpisodeInputProps,
          isOptional: true,
        } )}
        <span>
          {fileInfo.start && fileInfo.start > 0 ? secsToMmss(fileInfo.start) : "-"}
        </span>
      </span>
    </span>
    <span className={classes("line", style.startEnd)}>
      <span className={classes("height2", style.end)}>
        {ResourceInputNumber( {
          caption: EPISODE_FILE_INFO_PROPS.end.caption,
          ...getAndUpdateFileInfoByProp<number>("end"),
          ...commonEpisodeInputProps,
          isOptional: true,
        } )}
        <span>
          {fileInfo.end && fileInfo.end > 0 ? secsToMmss(fileInfo.end) : "-"}
        </span>
      </span>
    </span>
    <span className={classes("line", "height2", style.tags)}>
      <span>{EPISODE_PROPS.tags.caption}</span>
      {ResourceInputArrayString( {
        ...getAndUpdateEpisodeByProp("tags"),
        resourceState: state,
        addOnReset,
        onEmptyPressEnter: commonEpisodeInputProps.onPressEnter,
      } )}
    </span>
    <span className={classes("line", "height2", commonStyle.url)}>
      <span>
        <a href={slug}>Url</a>:</span><span className={commonStyle.content}>{slug}</span>
    </span>
    <span className={classes("line", "height2", style.duration)}>
      <span>Duration:</span>
      <span>{(isDefined(duration) && <>{secsToMmss(duration)} ({duration} s)</>) || "-"}</span>
    </span>
    <span className={classes("line", "height2", commonStyle.url)}>
      <span>{EPISODE_FILE_INFO_PROPS.path.caption}</span>
      <span className={commonStyle.content}>{data.resource.fileInfos[0].path}</span>
    </span>

    <span className={"break"} />
    <span className="line">
      <span><a onClick={() => reset()}>Reset</a></span>
      {isModified && <span className={commonStyle.update}>{
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
    <LastestComponent resourceId={resource.compKey} timestamp={state[0].date.timestamp}/>
  </div>;
}

function fullUrlOf(resource: EpisodeEntity) {
  return backendUrl(
    PATH_ROUTES.episodes.slug.withParams(resource.compKey.seriesKey, resource.compKey.episodeKey),
  );
}

function calcIsModified(r1: EpisodeHistoryEntryEntity, r2: EpisodeHistoryEntryEntity) {
  return isModifiedd(r1, r2, {
    ignoreNewUndefined: true,
    shouldMatch: {
      resource: {
        fileInfos: [
          {
            start: true,
            end: true,
          },
        ],
        disabled: true,
        tags: true,
        title: true,
        weight: true,
      },
    },
  } );
}
