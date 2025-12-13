import { EpisodeFileInfoEntity } from "$shared/models/episodes/file-info";
import { useCallback, useEffect, useState } from "react";
import { EpisodeEntity, EpisodeUserInfoEntity } from "$shared/models/episodes";
import { WithRequired } from "$shared/utils/objects/types";
import { assertIsNotEmpty } from "$shared/utils/validation";
import { classes } from "#modules/utils/styles";
import { FetchApi } from "#modules/fetching/fetch-api";
import { createActionsBar } from "#modules/utils/resources/elements/crud-buttons";
import { createFullOp, SetState } from "#modules/utils/resources/useCrud";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { usePublishEvent, useSubscription } from "#modules/utils/EventBus";
import commonStyle from "../../../history/entry/body-common.module.css";
import { EpisodesApi } from "../requests";
import styles from "./style.module.css";
import { useEpisodeCrudWithElements, UseEpisodeCrudWithElementsProps } from "./useEpisodeCrudWithElements";
import { useEpisodeFileInfoCrudWithElements } from "./useEpisodeFileInfoCrudWithElements";
import { useEpisodeUserInfoCrudWithElements } from "./useEpisodeUserInfoCrudWithElements";

type Data = WithRequired<EpisodeEntity, "fileInfos" | "userInfo">;

type Props = Omit<UseEpisodeCrudWithElementsProps<Data>, "onPressEnter">;
function EditEpisodeView( { data, setData }: Props) {
  async function update() {
    await createFullOp(episodeActions.update.op)();
    await createFullOp(fileInfoActions.update.op)();
    await createFullOp(userInfoActions.update.op)();
  }
  const onPressEnter = async () => {
    await update();
  };
  const { actions: episodeActions,
    elements, isModified: episodeIsModified } = useEpisodeCrudWithElements<EpisodeEntity>( {
      data,
      setData,
      onPressEnter,
    } );
  const { actions: fileInfoActions,
    elements: fileInfoElements,
    isModified: fileInfoIsModified } = useEpisodeFileInfoCrudWithElements( {
    data: data.fileInfos[0],
    setData: (newFileInfo: EpisodeFileInfoEntity)=> {
      setData(oldEp => oldEp
        ? ( {
          ...oldEp,
          fileInfos: [newFileInfo],
        } )
        : undefined);
    },
    onPressEnter,
  } );
  const { actions: userInfoActions,
    elements: userInfoElements,
    isModified: userInfoIsModified } = useEpisodeUserInfoCrudWithElements( {
    data: data.userInfo,
    setData: (userInfo: EpisodeUserInfoEntity)=> {
      setData(oldEp => {
        if (oldEp) {
          return {
            ...oldEp,
            userInfo,
          };
        }
      } );
    },
    onPressEnter,
  } );
  const isModified = episodeIsModified || fileInfoIsModified || userInfoIsModified;
  const updateIsDoing = episodeActions.update.isDoing || fileInfoActions.update.isDoing
    || userInfoActions.update.isDoing;
  const createActionsBarElement = useCallback(()=>createActionsBar( {
    spinnerSide: "left",
    isModified,
    reset: async ()=>{
      await Promise.all([
        episodeActions.reset(),
        fileInfoActions.reset(),
        userInfoActions.reset(),
      ]);
    },
    update: {
      isDoing: updateIsDoing,
      action: async ()=> {
        await update();
      },
    },
  } ), [
    episodeActions,
    fileInfoActions,
    userInfoActions,
    isModified,
  ]);
  const { titleElement, tagsElement } = elements;
  const { startElement,
    endElement,
    pathElement } = fileInfoElements;
  const { weightElement } = userInfoElements;

  return <>
    {createActionsBarElement()}
    <div className={classes(styles.container, commonStyle.container)}>
      <span className={classes("line", "height2")}>
        {titleElement}
      </span>
      <span className={classes("line", "height2")}>
        {weightElement}
      </span>
      <span className={classes("line", "height2", commonStyle.lineWrap)}>
        {startElement}
        {endElement}
      </span>
      <span className={classes("line", "height2")}>
        {tagsElement}
      </span>
      <span className={classes("line", "height2")}>
        {pathElement}
      </span>
    </div>
  </>;
}

export function usePublishEpisodeEvent(value: EpisodeEntity) {
  return usePublishEvent("EP" + value.id, value, [
    value.title,
    value.userInfo?.weight,
    value.fileInfos,
    value.tags,
  ]);
}

export function useEpisodeSubscription(id: string, cb: (d: Data)=> void) {
  useSubscription<Data>("EP" + id, cb);
}

type UseEditEpisodeProps = {
  initialData: Data;
  setData: SetState<Data>;
};
export function EditEpisode( { initialData,
  setData: parentSetData }: UseEditEpisodeProps) {
  const [data, setData] = useState<Data>(initialData);

  useEpisodeSubscription(initialData.id, (d)=> setData(d));

  useEffect(() => {
    parentSetData(old=>{
      return {
        ...old,
        ...data,
      };
    } );
  }, [data, parentSetData]);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(EpisodesApi);
    const result = await api.getManyByCriteria( {
      filter: {
        seriesKey: data.compKey.seriesKey,
        episodeKey: data.compKey.episodeKey,
      },
      expand: ["userInfo", "fileInfos"],
    } );

    assertIsNotEmpty(result.data);

    return result.data[0] as Data;
  }, [data.compKey.episodeKey]);

  return <AsyncLoader
    errorElement={<div>Error al cargar el episodio</div>}
    onSuccess={r=>setData(r)}
    action={fetchData}
  >
    <EditEpisodeView data={data} setData={setData}/>
  </AsyncLoader>;
}
