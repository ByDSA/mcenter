import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ImageCoverSelector, type ImageCoverSelectorProps } from "./Selector";
import styles from "./Modal.module.css";

export function useImageCoverSelectorModal(props: ImageCoverSelectorProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: ()=> {
      return openModal( {
        title: "Seleccionar imagen",
        className: styles.modal,
        content: <ImageCoverSelector {...props}/>,
      } );
    },
  };
}
