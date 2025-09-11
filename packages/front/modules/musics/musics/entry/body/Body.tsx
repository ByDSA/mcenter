import type { MusicEntity } from "#modules/musics/models";
import { Fragment, useCallback } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { isDefined } from "$shared/utils/validation";
import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfosApi } from "#modules/musics/file-info/requests";
import { classes } from "#modules/utils/styles";
import { secsToMmss } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { createActionsBar, DeleteResource } from "#modules/utils/resources/elements/crud-buttons";
import { OutputText } from "#modules/ui-kit/output/Text";
import { MUSIC_FILE_INFO_PROPS } from "../utils";
import commonStyle from "../../../../history/entry/body-common.module.css";
import { useMusicCrudWithElements, UseMusicCrudWithElementsProps } from "./useMusicCrudWithElements";
import styles from "./style.module.css";

export type BodyProps = UseMusicCrudWithElementsProps<MusicEntity> & {
  shouldFetchFileInfo?: boolean;
};

export function Body( { data, setData, shouldFetchFileInfo }: BodyProps) {
  const { actions,
    elements, optionalProps, isModified, state } = useMusicCrudWithElements( {
    data,
    setData,
    shouldFetchFileInfo,
  } );
  const { albumElement, artistElement,
    slugElement, tagsElement,
    titleElement, weightElement } = elements;
  const resource = state[0];
  const { fileInfos } = resource;
  const createActionsBarElement = useCallback(()=>createActionsBar( {
    spinnerSide: "left",
    isModified,
    reset: actions.reset,
    update: actions.update,
    remove: actions.remove,
  } ), [actions.update, actions.remove, isModified]);

  return <>
    {createActionsBarElement()}
    <div className={classes(styles.container)}>
      <span className={classes("line", styles.lineWrap)}>
        <span className={"height2"}>
          {titleElement}
        </span>
        <span className={"height2"}>
          {artistElement}
        </span>
      </span>
      <span className={classes("line", styles.lineWrap)}>
        <span className={"height2"}>
          {weightElement}
        </span>
        <span className={"height2"}>
          {albumElement}
        </span>
      </span>
      <span className={classes("line", "height2")}>
        {tagsElement}
      </span>
      <span className={classes("line", "height2")}>
        {slugElement}
      </span>

      <span className={classes("line", "height2")}>
        <a onClick={() => optionalProps.setAllVisible(v=>!v)}>{!optionalProps.allVisible

          ? "Mostrar"

          : "Ocultar"} todas las propiedades opcionales</a>
      </span>
      {Object.entries(optionalProps.elements)
        .map(([key, element]) => <span key={key}>{element}</span>)}

      <span className={"break"} />
      {fileInfos && renderFileInfos( {
        actions: {
          add: actions.addFileInfo,
          remove: actions.removeFileInfo,
        },
        musicId: data.id,
        fileInfos,
      } )}
    </div></>;
}

type RenderFileInfosProps = {
  fileInfos: MusicFileInfoEntity[];
  musicId: string;
  actions: {
    remove: (id: string)=> void;
    add: (f: MusicFileInfoEntity)=> void;
  };
};
function renderFileInfos( { fileInfos, musicId, actions }: RenderFileInfosProps) {
  const fileInfosApi = FetchApi.get(MusicFileInfosApi);

  return <details>
    <summary>Files ({fileInfos.length})</summary>
    {
      fileInfos.map((f)=>{
        const { duration } = f.mediaInfo;

        return (
          <Fragment key={f.hash}>
            <hr/>
            <span style={{
              display: "flex",
              justifyContent: "end",
              marginBottom: "0.5rem",
            }}>
              <DeleteResource action={async ()=> {
                if (confirm(`Borar este archivo?\n${ JSON.stringify(f, null, 2)}`)) {
                  await fileInfosApi.deleteOneById(f.id);
                  actions.remove(f.id);
                }
              }}
              isDoing={false} />
            </span>
            <span className={classes("line", "height2", commonStyle.autoBreakUrl)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS.path.caption,
                value: f.path,
              } )
            }</span>
            <span className={classes("line", "height2", styles.duration)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption,
                value: isDefined(duration) ? `${secsToMmss(duration)} (${duration} s)` : "-",
              } )
            }</span>
            <span className={classes("line", "height2", commonStyle.url)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS.hash.caption,
                value: f.hash,
              } )
            }</span>
            <span className={classes("line", "height2", commonStyle.url)}>
              <span>{MUSIC_FILE_INFO_PROPS.size.caption}</span>
              <span className={commonStyle.content}>{f.size}</span>
            </span>
            <span className={classes("line", "height2", commonStyle.url)}>
              <span>{MUSIC_FILE_INFO_PROPS["timestamps.createdAt"].caption}</span>
              <span className={commonStyle.content}>{f.timestamps.createdAt.toISOString()}</span>
            </span>
            <span className={classes("line", "height2", commonStyle.url)}>
              <span>{MUSIC_FILE_INFO_PROPS["timestamps.updatedAt"].caption}</span>
              <span className={commonStyle.content}>{f.timestamps.updatedAt.toISOString()}</span>
            </span>
          </Fragment>
        );
      } )
    }
    <FileUpload
      acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
      multiple={true}
      provideMetadata={()=> ( {
        musicId,
      } )}
      onUpload={genOnUpload( {
        url: backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
        // eslint-disable-next-line require-await
        onEachUpload: async (
          response: unknown,
          fileData: FileData,
          options: OnUploadOptions,
        )=> {
          const parsedResponse = MusicFileInfoCrudDtos.UploadFile.responseSchema.parse(response);

          options?.setSelectedFiles?.((old)=> ([
            ...old.filter(f=> f.id !== fileData.id),
          ]));
          actions.add(parsedResponse.data.fileInfo);
        },
      } )}
    />
  </details>;
}
