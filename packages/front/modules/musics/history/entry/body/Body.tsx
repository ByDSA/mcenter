import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { useCallback } from "react";
import { classes } from "#modules/utils/styles";
import { secsToMmss } from "#modules/utils/dates";
import { useMusicCrudWithElements } from "#modules/musics/musics/entry/body/useMusicCrudWithElements";
import { createActionsBar } from "#modules/utils/resources/elements/crud-buttons";
import { MUSIC_FILE_INFO_PROPS } from "#modules/musics/musics/entry/utils";
import { OutputText } from "#modules/ui-kit/output/Text";
import { OptionalPropsButton } from "#modules/musics/musics/entry/body/elements";
import { MusicHistoryApi } from "../../requests";
import { useMusicHistoryEntryEdition } from "../../useMusicHistoryEntryCrud";
import styles from "../../../musics/entry/body/styles.module.css";
import { LastestComponent } from "./Lastest";

type Data = MusicHistoryApi.GetManyByCriteria.Data;

type Props = {
  data: Data;
  setData: (newData: Data)=> void;
};
export function Body( { data, setData }: Props) {
  const { actions: musicActions, elements: musicElements,
    optionalProps, isModified, state } = useMusicCrudWithElements( {
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
  const resource = state[0];
  const fileInfo = resource.fileInfos?.[0];

  assertIsDefined(fileInfo);
  const { duration } = fileInfo.mediaInfo;
  const createActionsBarElement = useCallback(()=>createActionsBar( {
    spinnerSide: "left",
    isModified,
    reset: musicActions.reset,
    update: musicActions.update,
    remove: historyActions.remove,
  } ), [musicActions.update, historyActions.remove, isModified]);
  const fileInfoElements = {
    durationElement: OutputText( {
      caption: MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption,
      value: isDefined(duration) ? `${secsToMmss(duration)} (${duration} s)` : "-",
    } ),
    pathElement: OutputText( {
      caption: MUSIC_FILE_INFO_PROPS.path.caption,
      value: data.resource.fileInfos[0].path,
    } ),
  };

  return <>
    {createActionsBarElement()}
    <div className={classes(styles.container)}>
      <span className={classes("line", styles.lineWrap)}>
        <span className={"height2"}>
          {musicElements.titleElement}
        </span>
        <span className={"height2"}>
          {musicElements.artistElement}
        </span>
      </span>
      <span className={classes("line", styles.lineWrap)}>
        <span className={classes("height2")}>
          {musicElements.weightElement}
        </span>
        <span className={classes("height2")}>
          {musicElements.albumElement}
        </span>
      </span>
      <span className={classes("line", "height2")}>
        {musicElements.tagsElement}
      </span>
      <span className={classes("line", "height2")}>
        {musicElements.slugElement}
      </span>
      <span className={classes("line", "height2")}> {
        fileInfoElements.durationElement
      }</span>
      <OptionalPropsButton
        isVisible={optionalProps.allVisible}
        onClick={() => optionalProps.setAllVisible(v=>!v)}
      />
      {Object.entries(optionalProps.elements)
        .map(([key, element]) => <span key={key}>{element}</span>)}

      <span className={"break"} />
      <hr/>
      <span className={"break"} />
      <LastestComponent resourceId={data.resourceId} date={data.date}/>
    </div>
  </>;
}
