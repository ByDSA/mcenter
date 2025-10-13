import { useCallback } from "react";
import { classes } from "#modules/utils/styles";
import { useMusicCrudWithElements } from "#modules/musics/musics/entry/body/useMusicCrudWithElements";
import { createActionsBar } from "#modules/utils/resources/elements/crud-buttons";
import { OptionalPropsButton } from "#modules/musics/musics/entry/body/elements";
import { MusicHistoryApi } from "../../requests";
import { useMusicHistoryEntryEdition } from "../../useMusicHistoryEntryCrud";
import styles from "../../../musics/entry/body/styles.module.css";
import commonStyles from "../../../../history/entry/body-common.module.css";
import { LastestComponent } from "./Lastest";

type Data = MusicHistoryApi.GetManyByCriteria.Data;

type Props = {
  data: Data;
  setData: (newData: Data)=> void;
};
export function Body( { data, setData }: Props) {
  const { actions: musicActions, elements: musicElements,
    optionalProps, isModified } = useMusicCrudWithElements( {
    data: data.resource,
    setData: (d: Data["resource"])=>setData(( {
      ...data,
      resource: d,
    } )),
    shouldFetchFileInfo: true,
  } );
  const { actions: historyActions } = useMusicHistoryEntryEdition<Data>( {
    data,
    setData,
  } );
  const createActionsBarElement = useCallback(()=>createActionsBar( {
    spinnerSide: "left",
    isModified,
    reset: musicActions.reset,
    update: musicActions.update,
    remove: historyActions.remove,
  } ), [musicActions.update, historyActions.remove, isModified]);

  return <>
    {createActionsBarElement()}
    <div className={classes(styles.container)}>
      <span className={classes("line", "height2", commonStyles.lineWrap)}>

        {musicElements.titleElement}

        {musicElements.artistElement}

      </span>
      <span className={classes("line", "height2", commonStyles.lineWrap)}>
        {musicElements.weightElement}
        {musicElements.albumElement}
      </span>
      <span className={classes("line", "height2")}>
        {musicElements.tagsElement}
      </span>
      <span className={classes("line", "height2")}>
        {musicElements.slugElement}
      </span>
      <OptionalPropsButton
        isVisible={optionalProps.allVisible}
        onClick={() => optionalProps.setAllVisible(v=>!v)}
      />
      {Object.entries(optionalProps.elements)
        .map(([key, element]) => <span key={key}>{element}</span>)}

      <span className={"break"} />
      <hr/>
      <span className={"break"} />
      <LastestComponent resourceId={data.resourceId} date={data.date} userId={data.userId}/>
    </div>
  </>;
}
