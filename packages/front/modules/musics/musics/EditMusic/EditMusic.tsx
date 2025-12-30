import type { MusicEntityWithUserInfo } from "#modules/musics/models";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MusicEntity } from "$shared/models/musics";
import { classes } from "#modules/utils/styles";
import { createActionsBar } from "#modules/utils/resources/elements/crud-buttons";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "#modules/musics/requests";
import { Button } from "#modules/ui-kit/input/Button";
import { useFileInfosModal } from "#modules/musics/file-info/EditFileInfos/Modal";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { createFullOp } from "#modules/utils/resources/useCrud";
import { usePublishEvent, useSubscription } from "#modules/utils/EventBus";
import { useMusic } from "#modules/musics/hooks";
import commonStyles from "../../../history/entry/body-common.module.css";
import { useMusicCrudWithElements, UseMusicCrudWithElementsProps } from "./useMusicCrudWithElements";
import { OptionalPropsButton } from "./elements";
import styles from "./styles.module.css";

export type BodyProps = Omit<UseMusicCrudWithElementsProps<MusicEntity>, "setData">;

function EditMusicView( { data }: BodyProps) {
  const { actions,
    elements, optionalProps, isModified } = useMusicCrudWithElements( {
    data,
  } );
  const createActionsBarElement = useCallback(()=>createActionsBar( {
    spinnerSide: "left",
    isModified,
    reset: actions.reset,
    update: {
      action: async ()=>{
        await createFullOp(actions.update.op)();
      },
      isDoing: actions.update.isDoing,
    },
    remove: {
      action: async ()=>{
        await createFullOp(actions.remove.op)();
      },
      isDoing: actions.remove.isDoing,
    },
  } ), [actions.update, actions.remove, isModified]);
  const fileInfosElement = useMemo(() => <EditFileInfosButton
    actions={ {
      add: actions.addFileInfo,
      remove: actions.removeFileInfo,
    }}
    musicId={data.id}
  />, [data.id]);

  if (!data)
    return <p>Música no encontrada</p>;

  const { albumElement, artistElement,
    slugElement, tagsElement,
    titleElement, weightElement } = elements;

  return <>
    {createActionsBarElement()}
    <div className={classes(styles.container)}>
      <span className={classes("line", "height2", commonStyles.lineWrap)}>
        {titleElement}
        {artistElement}
      </span>
      <span className={classes("line", "height2", commonStyles.lineWrap)}>
        {weightElement}
        {albumElement}
      </span>
      <span className={classes("line", "height2")}>
        {tagsElement}
      </span>
      <span className={classes("line", "height2")}>
        {slugElement}
      </span>

      <OptionalPropsButton
        isVisible={optionalProps.allVisible}
        onClick={() => optionalProps.setAllVisible(v=>!v)}
      />
      {Object.entries(optionalProps.elements)
        .map(([key, element]) => <span key={key}>{element}</span>)}

      <span className={"break"} />
      {fileInfosElement}
    </div></>;
}

export function usePublishMusicEvent(value: MusicEntity) {
  return usePublishEvent("MUS" + value.id, value, [
    value.title,
    value.artist,
    value.slug,
    value.userInfo,
    value.fileInfos,
    value.tags,
    value.album,
  ]);
}

export function useMusicSubscription(id: string, cb: (d: MusicEntity)=> void) {
  useSubscription<MusicEntity>("MUS" + id, cb);
}

type UseEditMusicProps = {
  initialData: MusicEntity;
};
export function EditMusic( { initialData }: UseEditMusicProps) {
  const [data, setData] = useState<MusicEntity>(initialData);

  useMusicSubscription(initialData.id, (d)=> setData(d));

  useEffect(() => {
    useMusic.updateCache(initialData.id, data);
  }, [data]);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicsApi);
    const result = await api.getOneByCriteria( {
      filter: {
        id: initialData.id,
      },
      expand: ["userInfo"],
    } );

    return result.data as MusicEntityWithUserInfo;
  }, [initialData.id]);

  return <AsyncLoader
    errorElement={<div>Error al cargar la música</div>}
    action={fetchData}
    onSuccess={d=>setData(d)}
  >
    <EditMusicView data={data}/>
  </AsyncLoader>;
}

export function EditFileInfosButton(props: Parameters<typeof useFileInfosModal>[0]) {
  const { openModal } = useFileInfosModal(props);

  return <Button
    theme="white"
    onClick={async _=> {
      await openModal();
    }} >Editar archivos</Button>;
}
