import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { EditFileInfosLoader, UseEditFileInfosContentModalProps } from "./Form";
import styles from "./Modal.module.css";

export function useFileInfosModal(props: UseEditFileInfosContentModalProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: ()=> {
      return openModal( {
        title: "Editar archivos de música",
        className: styles.modal,
        content: <EditFileInfosLoader {...props}/>,
      } );
    },
  };
}
