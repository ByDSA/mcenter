import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { isDefined } from "$shared/utils/validation";
import { useCallback, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { secsToMmss, formatDateDDMMYYYHHmm } from "#modules/utils/dates";
import { DeleteResource } from "#modules/utils/resources/elements/crud-buttons";
import { bytesToStr } from "#modules/utils/sizes";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { FormInputGroup, FormInputGroupItem } from "#modules/musics/musics/Edit/FormInputGroup";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { FormText } from "#modules/ui-kit/form/Text/FormText";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { MusicFileInfosApi } from "../requests";
import { MUSIC_FILE_INFO_PROPS } from "../utils";
import { useUploadMusicFileModal } from "./UploadMusicFileModal";

export type UseEditFileInfosContentModalProps = {
  musicId: string;
  actions: {
    remove: (id: string)=> void;
    add: (f: MusicFileInfoEntity)=> void;
  };
};

export function EditFileInfosLoader( { musicId,
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
    <LocalDataProvider data={data} setData={setData}>
      <EditFileInfosForm
        actions={actions}
        musicId={musicId}
      />
    </LocalDataProvider>
  </AsyncLoader>;
}

function dataJsx(f: MusicFileInfoEntity) {
  return <div>
    <FormInputGroup inline>
      <FormLabel>Path</FormLabel>
      <span>{f.path}</span>
    </FormInputGroup>
    <FormInputGroup inline>
      <FormLabel>Duración</FormLabel>
      <span>{f.mediaInfo.duration ? secsToMmss(f.mediaInfo.duration) : "-"}</span>
    </FormInputGroup>
    <FormInputGroup inline>
      <FormLabel>Size</FormLabel>
      <span>{bytesToStr(f.size)}</span>
    </FormInputGroup>
  </div>;
}

type EditFileInfosViewProps = UseEditFileInfosContentModalProps;
// eslint-disable-next-line @typescript-eslint/naming-convention
const EditFileInfosForm = ( { actions, musicId }: EditFileInfosViewProps) => {
  const { openModal: openUploadModal } = useUploadMusicFileModal();
  const fileInfosApi = FetchApi.get(MusicFileInfosApi);
  const { openModal } = useConfirmModal();
  const { data } = useLocalData<MusicFileInfoEntity[]>();

  return <>
    <header style={{
      display: "flex",
      justifyContent: "end",
    }}>
      <Button
        theme="white"
        onClick={async () => {
          await openUploadModal( {
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
            <FormInputGroup>
              <FormInputGroupItem inline>
                <FormLabel>{MUSIC_FILE_INFO_PROPS.path.caption}</FormLabel>
                <FormText>{f.path}</FormText>
              </FormInputGroupItem>

              <FormInputGroupItem inline>
                <FormLabel>{MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption}</FormLabel>
                <FormText>{isDefined(duration) ? secsToMmss(duration) : "-"}</FormText>
              </FormInputGroupItem>

              <FormInputGroupItem inline>
                <FormLabel>{MUSIC_FILE_INFO_PROPS.size.caption}</FormLabel>
                <FormText>{bytesToStr(f.size)}</FormText>
              </FormInputGroupItem>

              <FormInputGroupItem inline>
                <FormLabel>{MUSIC_FILE_INFO_PROPS["timestamps.createdAt"].caption}</FormLabel>
                <FormText>{formatDateDDMMYYYHHmm(f.timestamps.createdAt)}</FormText>
              </FormInputGroupItem>

              <FormInputGroupItem inline>
                <FormLabel>{MUSIC_FILE_INFO_PROPS["timestamps.updatedAt"].caption}</FormLabel>
                <FormText>{formatDateDDMMYYYHHmm(f.timestamps.updatedAt)}</FormText>
              </FormInputGroupItem>

              <FormInputGroupItem inline>
                <FormLabel>{MUSIC_FILE_INFO_PROPS.hash.caption}</FormLabel>
                <FormText>{f.hash}</FormText>
              </FormInputGroupItem>
            </FormInputGroup>
          </Fragment>
        );
      } )
    }
  </>;
};
