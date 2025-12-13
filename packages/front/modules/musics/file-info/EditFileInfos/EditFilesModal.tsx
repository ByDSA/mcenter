import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { isDefined } from "$shared/utils/validation";
import { useCallback, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { OutputText } from "#modules/ui-kit/output/Text";
import { secsToMmss, formatDateDDMMYYYHHmm } from "#modules/utils/dates";
import { DeleteResource } from "#modules/utils/resources/elements/crud-buttons";
import { bytesToStr } from "#modules/utils/sizes";
import { classes } from "#modules/utils/styles";
import { Button } from "#modules/ui-kit/input/Button";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { MusicFileInfosApi } from "../../file-info/requests";
import commonStyle from "../../../history/entry/body-common.module.css";
import { MUSIC_FILE_INFO_PROPS } from "../utils";
import { useUploadMusicFileModal } from "./UploadMusicFileModal";
import styles from "./styles.module.css";

export type UseEditFileInfosContentModalProps = {
  musicId: string;
  actions: {
    remove: (id: string)=> void;
    add: (f: MusicFileInfoEntity)=> void;
  };
};

export function EditFileInfos( { musicId,
  actions }: UseEditFileInfosContentModalProps) {
  const [data, setData] = useState<MusicFileInfoEntity[]>([]);
  const fetchData = useCallback(async () => {
    const api = FetchApi.get(MusicFileInfosApi);
    const result = await api.getAllByMusicId(musicId);

    return result.data;
  }, [musicId]);

  return <AsyncLoader
    errorElement={<div>Error al cargar los archivos de música</div>}
    action={fetchData}
    onSuccess={r=>setData(r)}
  >
    <EditFileInfosView
      data={data}
      actions={actions}
      musicId={musicId}
    />
  </AsyncLoader>;
}

function dataJsx(f: MusicFileInfoEntity) {
  return <div>
    <p>Path: {f.path}</p>
    <p>Duración: {f.mediaInfo.duration ? secsToMmss(f.mediaInfo.duration) : "-"}</p>
    <p>Size: {bytesToStr(f.size)}</p>
  </div>;
}

type EditFileInfosViewProps = UseEditFileInfosContentModalProps & {
  data: any;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const EditFileInfosView = ( { actions, musicId, data }: EditFileInfosViewProps) => {
  const { openModal: openUploadModal } = useUploadMusicFileModal();
  const fileInfosApi = FetchApi.get(MusicFileInfosApi);
  const { openModal } = useConfirmModal();

  return <>
    <header style={{
      display: "flex",
      justifyContent: "end",
    }}>
      <Button
        theme="white"
        onClick={async () => {
          await openUploadModal( {
            add: actions.add,
            musicId,
          } );
        }}
      >
            Subir nuevo archivo
      </Button>
    </header>
    <p>Archivos: ({data.length})</p>
    {
      data.map((f)=>{
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
                  content: (<>
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
            <span className={classes("line", "height2")}>{
              OutputText( {
                className: commonStyle.autoBreakUrl,
                caption: MUSIC_FILE_INFO_PROPS.path.caption,
                value: f.path,
              } )
            }</span>
            <span className={classes("line", "height2")}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption,
                value: isDefined(duration)
                  ? secsToMmss(duration)
                  : "-",
              } )
            }</span>
            <span className={classes("line", "height2")}>{
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
            <span className={classes("line", "height2", styles.hash, commonStyle.autoBreakUrl)}>{
              OutputText( {
                caption: MUSIC_FILE_INFO_PROPS.hash.caption,
                value: f.hash,
              } )
            }</span>
          </Fragment>
        );
      } )
    }
  </>;
};
