import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { NewImageCoverForm, NewImageCoverProps } from "./Form";
import styles from "./Content.module.css";

export function useNewImageCoverModal(props: NewImageCoverProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Nueva Image Cover",
        className: styles.content,
        content: <NewImageCoverForm {...props} />,
      } );
    },
  };
}
