import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { EditFileInfosLoader, LoaderProps } from "./Loader";
import styles from "./Modal.module.css";

export function useFileInfosModal(props: LoaderProps) {
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
