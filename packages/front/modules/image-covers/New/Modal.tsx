import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { NewImageCover, NewImageCoverProps } from "./Content";

export function useNewImageCoverModal(props: NewImageCoverProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Nueva Image Cover",
        content: <NewImageCover {...props} />,
      } );
    },
  };
}
