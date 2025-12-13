import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { genOnUpload, FileData, OnUploadOptions, FileUpload } from "#modules/ui-kit/upload/FileUpload";
import { YouTubeUpload } from "#modules/ui-kit/upload/YouTubeUpload";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import styles from "./UploadMusicFileModal.module.css";

type OpenModalProps = {
  musicId: string;
  add: (fileInfo: MusicFileInfoEntity)=> void;
};
export const useUploadMusicFileModal = () => {
  const { openModal, ...ret } = useModal();

  return {
    ...ret,
    openModal: (props: OpenModalProps)=>openModal( {
      title: "Añadir nuevos archivos a música",
      className: styles.modal,
      content: (
        <>
          <p>Desde YouTube:</p>
          <YouTubeUpload
            musicId={props.musicId}
            withCredentials
            onCreateMusicFileInfo={musicFileInfo => {
              props.add(musicFileInfo);
            }}
          />
          <p>Desde local:</p>
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
                props.add(parsedResponse.data.fileInfo);
              },
            } )}
          />
        </>
      ),
    } ),
  };
};
