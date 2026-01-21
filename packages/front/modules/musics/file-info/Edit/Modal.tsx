import { MusicFileInfoEntity } from "$shared/models/musics/file-info";
import { useState } from "react";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { DaFooterButtons } from "#modules/ui-kit/form/Footer/Buttons/FooterButtons";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { DaCloseModalButton } from "#modules/ui-kit/modal/CloseButton";
import { EditFileInfosLoader, LoaderProps } from "./Loader";
import styles from "./Modal.module.css";
import { useUploadMusicFileModal } from "./UploadMusicFileModal";

export function useFileInfosModal(props: LoaderProps) {
  const { openModal, ...usingModal } = useModal();
  const [data, setData] = useState<MusicFileInfoEntity[] | undefined>(undefined);

  return {
    ...usingModal,
    openModal: ()=> {
      return openModal( {
        title: "Editar archivos de música",
        className: styles.modal,
        content: <LocalDataProvider data={data} setData={setData}>
          <ModalContent musicId={props.musicId}/>
        </LocalDataProvider>,
      } );
    },
  };
}

type ModalContentProps = {
  musicId: string;
};
const ModalContent = (props: ModalContentProps) => {
  const { openModal: openUploadModal } = useUploadMusicFileModal();
  const [data, setData] = useState<MusicFileInfoEntity[] | undefined>(undefined);

  return <LocalDataProvider data={data} setData={setData}>
    <header className={styles.contentHeader}>
      <DaButton
        theme="white"
        disabled={!data}
        onClick={async () => {
          await openUploadModal( {
            musicId: props.musicId,
          } );
        }}
      >
            Subir nuevo archivo
      </DaButton>
    </header>
    <EditFileInfosLoader {...props}/>
    <DaFooterButtons>
      <DaCloseModalButton />
    </DaFooterButtons>
  </LocalDataProvider>;
};
