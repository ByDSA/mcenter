import type { MusicEntityWithUserInfo } from "#modules/musics/models";
import { Fragment, useCallback } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { isDefined } from "$shared/utils/validation";
import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfosApi } from "#modules/musics/file-info/requests";
import { classes } from "#modules/utils/styles";
import { formatDateDDMMYYYHHmm, secsToMmss } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FileData, FileUpload, genOnUpload, OnUploadOptions } from "#modules/ui-kit/upload/FileUpload";
import { createActionsBar, DeleteResource } from "#modules/utils/resources/elements/crud-buttons";
import { OutputText } from "#modules/ui-kit/output/Text";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { bytesToStr } from "#modules/utils/sizes";
import { MUSIC_FILE_INFO_PROPS } from "../utils";
import commonStyle from "../../../../history/entry/body-common.module.css";
import { useMusicCrudWithElements, UseMusicCrudWithElementsProps } from "./useMusicCrudWithElements";
import styles from "./styles.module.css";
import { OptionalPropsButton } from "./elements";

export type BodyProps = UseMusicCrudWithElementsProps<MusicEntityWithUserInfo> & {
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

      <OptionalPropsButton
        isVisible={optionalProps.allVisible}
        onClick={() => optionalProps.setAllVisible(v=>!v)}
      />
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

function dataJsx(f: MusicFileInfoEntity) {
  return <div>
    <span>Path: {f.path}</span><br/>
    <span>Duración: {f.mediaInfo.duration ? secsToMmss(f.mediaInfo.duration) : "-"}</span><br/>
    <span>Size: {bytesToStr(f.size)}</span>
  </div>;
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
  const { openModal } = useConfirmModal();

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
                await openModal( {
                  title: "Confirmar borrado",
                  staticContent: (<>
                    <p>¿Borrar este archivo?</p>
                    {dataJsx(f)}
                  </>),
                  action: async () => {
                    await fileInfosApi.deleteOneById(f.id);
                    actions.remove(f.id);

                    return true;
                  },
                } );
              }}
              isDoing={false} />
            </span>
            <span className={classes("line", "height2", styles.path)}>{
              OutputText( {
                className: commonStyle.autoBreakUrl,
                caption: MUSIC_FILE_INFO_PROPS.path.caption,
                value: f.path,
              } )
            }</span>
            <span className={classes("line", "height2", styles.duration)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption,
                value: isDefined(duration)
                  ? secsToMmss(duration)
                  : "-",
              } )
            }</span>
            <span className={classes("line", "height2", styles.size)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS.size.caption,
                value: bytesToStr(f.size),
              } )}
            </span>
            <span className={classes("line", "height2", styles.createdAt)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS["timestamps.createdAt"].caption,
                value: formatDateDDMMYYYHHmm(f.timestamps.createdAt),
              } )}
            </span>
            <span className={classes("line", "height2", styles.updatedAt)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS["timestamps.updatedAt"].caption,
                value: formatDateDDMMYYYHHmm(f.timestamps.updatedAt),
              } )}
            </span>
            <span className={classes("line", "height2", styles.hash)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS.hash.caption,
                value: f.hash,
              } )
            }</span>
          </Fragment>
        );
      } )
    }
    <div className={styles.uploaders}>
      <YouTubeUpload
        musicId={musicId}
        withCredentials
        onCreateMusicFileInfo={musicFileInfo=> {
          actions.add(musicFileInfo);
        }}
      />
      <FileUpload
        acceptedTypes={AUDIO_EXTENSIONS.map(s=>`.${s}`)}
        multiple={true}
        provideMetadata={()=> ( {
          musicId,
        } )}
        onUpload={genOnUpload( {
          url: backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
          withCredentials: true,
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
    </div>

  </details>;
}
