import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { useCallback } from "react";
import { backendUrl } from "#modules/requests";
import { genOnUpload, FileData, OnUploadOptions, FileUpload } from "#modules/ui-kit/upload/FileUpload";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { FormInputGroup, FormInputGroupItem } from "#modules/ui-kit/form/FormInputGroup";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { useLocalData } from "#modules/utils/local-data-context";
import styles from "./UploadMusicFileModal.module.css";

type OpenModalProps = {
  musicId: string;
};
export const useUploadMusicFileModal = () => {
  const { openModal, ...ret } = useModal();
  const { setData } = useLocalData<MusicFileInfoEntity[]>();

  assertIsDefined(setData);
  const add = useCallback((musicFileInfo: MusicFileInfoEntity)=> {
    setData(old=>{
      if (!old)
        return old;

      return [...old, musicFileInfo];
    } );
  }, [setData]);

  return {
    ...ret,
    openModal: (props: OpenModalProps)=>openModal( {
      title: "Añadir nuevos archivos a música",
      className: styles.modal,
      content: (
        <FormInputGroup>
          <FormInputGroupItem>
            <FormLabel>Desde YouTube</FormLabel>
            <YouTubeUpload
              musicId={props.musicId}
              withCredentials
              onCreateMusicFileInfo={musicFileInfo => {
                add(musicFileInfo);
              }}
            />
          </FormInputGroupItem>
          <FormInputGroupItem>
            <FormLabel>Desde local</FormLabel>
            <FileUpload
              acceptedTypes={AUDIO_EXTENSIONS.map(s => `.${s}`)}
              multiple={true}
              provideMetadata={() => ( {
                musicId: props.musicId,
              } )}
              onUpload={genOnUpload( {
                url: backendUrl(PATH_ROUTES.musics.fileInfo.upload.path),
                withCredentials: true,
                // eslint-disable-next-line require-await
                onEachUpload: async (
                  response: unknown,
                  fileData: FileData,
                  options: OnUploadOptions,
                ) => {
                  const parsedResponse = MusicFileInfoCrudDtos.UploadFile
                    .responseSchema.parse(response);

                  options?.setSelectedFiles?.((old) => ([
                    ...old.filter(f => f.id !== fileData.id),
                  ]));
                  add(parsedResponse.data.fileInfo);
                },
              } )}
            />
          </FormInputGroupItem>
        </FormInputGroup>
      ),
    } ),
  };
};
