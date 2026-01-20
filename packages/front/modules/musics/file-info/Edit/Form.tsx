import type { LoaderProps } from "./Loader";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { Fragment } from "react/jsx-runtime";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { secsToMmss, formatDateDDMMYYYHHmm } from "#modules/utils/dates";
import { DeleteResource } from "#modules/musics/file-info/Edit/crud-buttons";
import { bytesToStr } from "#modules/utils/sizes";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { FormInputGroup, FormInputGroupItem } from "#modules/ui-kit/form/FormInputGroup";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { FormText } from "#modules/ui-kit/form/Text/FormText";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicFileInfosApi } from "../requests";
import { MUSIC_FILE_INFO_PROPS } from "../utils";
import { useUploadMusicFileModal } from "./UploadMusicFileModal";
import styles from "./Form.module.css";

type EditFileInfosViewProps = LoaderProps;

export const EditFileInfosForm = ( { musicId }: EditFileInfosViewProps) => {
  const { openModal: openUploadModal } = useUploadMusicFileModal();
  const fileInfosApi = FetchApi.get(MusicFileInfosApi);
  const { openModal } = useConfirmModal();
  const { data, setData } = useLocalData<MusicFileInfoEntity[]>();

  assertIsDefined(setData);

  return <>
    <header className={styles.header}>
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
            <span className={styles.item}>
              <DeleteResource action={async ()=> {
                await openModal( {
                  title: "Confirmar borrado",
                  content: (<>
                    <p>¿Borrar este archivo?</p>
                    <div>
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
                    </div>
                  </>),
                  action: async () => {
                    await fileInfosApi.deleteOneById(f.id);
                    setData(old=> {
                      if (!old)
                        return old;

                      return old.filter(i=>i.id !== f.id);
                    } );

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
