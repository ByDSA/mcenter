import type { LoaderProps } from "./Loader";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { Fragment } from "react/jsx-runtime";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { secsToMmss, formatDateDDMMYYYHHmm } from "#modules/utils/dates";
import { DeleteResource } from "#modules/musics/file-info/Edit/crud-buttons";
import { bytesToStr } from "#modules/utils/sizes";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { DaText } from "#modules/ui-kit/form/Text/Text";
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
      <DaButton
        theme="white"
        onClick={async () => {
          await openUploadModal( {
            musicId,
          } );
        }}
      >
            Subir nuevo archivo
      </DaButton>
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
                      <DaInputGroup inline>
                        <DaLabel>Path</DaLabel>
                        <span>{f.path}</span>
                      </DaInputGroup>
                      <DaInputGroup inline>
                        <DaLabel>Duración</DaLabel>
                        <span>{f.mediaInfo.duration ? secsToMmss(f.mediaInfo.duration) : "-"}</span>
                      </DaInputGroup>
                      <DaInputGroup inline>
                        <DaLabel>Size</DaLabel>
                        <span>{bytesToStr(f.size)}</span>
                      </DaInputGroup>
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
            <DaInputGroup>
              <DaInputGroupItem inline>
                <DaLabel>{MUSIC_FILE_INFO_PROPS.path.caption}</DaLabel>
                <DaText>{f.path}</DaText>
              </DaInputGroupItem>

              <DaInputGroupItem inline>
                <DaLabel>{MUSIC_FILE_INFO_PROPS["mediaInfo.duration"].caption}</DaLabel>
                <DaText>{isDefined(duration) ? secsToMmss(duration) : "-"}</DaText>
              </DaInputGroupItem>

              <DaInputGroupItem inline>
                <DaLabel>{MUSIC_FILE_INFO_PROPS.size.caption}</DaLabel>
                <DaText>{bytesToStr(f.size)}</DaText>
              </DaInputGroupItem>

              <DaInputGroupItem inline>
                <DaLabel>{MUSIC_FILE_INFO_PROPS["timestamps.createdAt"].caption}</DaLabel>
                <DaText>{formatDateDDMMYYYHHmm(f.timestamps.createdAt)}</DaText>
              </DaInputGroupItem>

              <DaInputGroupItem inline>
                <DaLabel>{MUSIC_FILE_INFO_PROPS["timestamps.updatedAt"].caption}</DaLabel>
                <DaText>{formatDateDDMMYYYHHmm(f.timestamps.updatedAt)}</DaText>
              </DaInputGroupItem>

              <DaInputGroupItem inline>
                <DaLabel>{MUSIC_FILE_INFO_PROPS.hash.caption}</DaLabel>
                <DaText>{f.hash}</DaText>
              </DaInputGroupItem>
            </DaInputGroup>
          </Fragment>
        );
      } )
    }
  </>;
};
