import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { useCallback, useState } from "react";
import { EpisodeEntity } from "$shared/models/episodes";
import { classes } from "#modules/utils/styles";
import { useHistoryEntryEdition } from "#modules/history";
import { FetchApi } from "#modules/fetching/fetch-api";
import { createActionsBar } from "#modules/utils/resources/elements/crud-buttons";
import { mergeCrudOp } from "#modules/utils/resources/useCrud";
import { EpisodeHistoryApi } from "../../requests";
import commonStyle from "../../../../../history/entry/body-common.module.css";
import { LastestComponent } from "./Lastest";
import styles from "./style.module.css";
import { useEpisodeCrudWithElements } from "./useEpisodeCrudWithElements";
import { useEpisodeFileInfoCrudWithElements } from "./useEpisodeFileInfoCrudWithElements";

type Data = EpisodeHistoryApi.GetMany.Data;

type Props = {
  data: Data;
  setData: ReturnType<typeof useState<Data>>[1];
};
export function Body( { data, setData }: Props) {
  const onPressEnter = () => {
    return Promise.all([
      episodeActions.update.action(),
      fileInfoActions.update.action(),
    ]);
  };
  const { actions: episodeActions,
    elements, isModified: episodeIsModified } = useEpisodeCrudWithElements<EpisodeEntity>( {
      data: data.resource,
      setData: (e: EpisodeEntity)=> {
        setData( {
          ...data,
          resource: {
            ...e,
            fileInfos: data.resource.fileInfos,
          },
        } );
      },
      onPressEnter,
    } );
  const { actions: fileInfoActions,
    elements: fileInfoElements,
    isModified: fileInfoIsModified } = useEpisodeFileInfoCrudWithElements( {
    data: data.resource.fileInfos[0],
    setData: (fileInfo: EpisodeFileInfoEntity)=> {
      setData( {
        ...data,
        resource: {
          ...data.resource,
          fileInfos: [fileInfo],
        },
      } );
    },
    onPressEnter,
  } );
  const historyApi = FetchApi.get(EpisodeHistoryApi);
  const { state, remove } = useHistoryEntryEdition<Data>( {
    data,
    setData,
    fetchRemove: async ()=> {
      const res = await historyApi.delete(data.id);

      return {
        data: res.data as Data,
        success: true,
      };
    },
  } );
  const createActionsBarElement = useCallback(()=>createActionsBar( {
    spinnerSide: "left",
    isModified: episodeIsModified || fileInfoIsModified,
    reset: async ()=>{
      await Promise.all([
        episodeActions.reset(),
        fileInfoActions.reset(),
      ]);
    },
    update: mergeCrudOp(episodeActions.update, fileInfoActions.update),
    remove,
  } ), [remove, episodeActions, fileInfoActions, episodeIsModified, fileInfoIsModified]);
  const { titleElement, tagsElement, urlElement, weightElement } = elements;
  const { resource } = state[0];
  const { startElement,
    endElement,
    pathElement,
    durationElement } = fileInfoElements;

  return <>
    {createActionsBarElement()}
    <div className={classes(styles.container, commonStyle.container)}>
      <span className={classes("line", "height2")}>
        {titleElement}
      </span>
      <span className={classes("line", "height2")}>
        {weightElement}
      </span>
      <span className={classes("line", "height2")}>
        {startElement}
      </span>
      <span className={classes("line", "height2")}>
        {endElement}
      </span>
      <span className={classes("line", "height2")}>
        {tagsElement}
      </span>
      <span className={classes("line", "height2")}>
        {urlElement}
      </span>
      <span className={classes("line", "height2")}>
        {durationElement}
      </span>
      <span className={classes("line", "height2")}>
        {pathElement}
      </span>
      <span className="break"></span>
      <hr/>
      <span className="break"></span>
      <LastestComponent resourceId={resource.compKey} timestamp={state[0].date.timestamp}/>
    </div>
  </>;
}
