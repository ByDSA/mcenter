import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { EditFileInfos, UseEditFileInfosContentModalProps } from "./EditFilesModal";

export function useFileInfosModal(props: UseEditFileInfosContentModalProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: ()=> {
      return openModal( {
        title: "Editar archivos de música",
        content: <EditFileInfos {...props}/>,
      } );
    },
  };
}
