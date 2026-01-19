import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { NewImageCoverForm, NewImageCoverProps } from "./Form";

export function useNewImageCoverModal(props: NewImageCoverProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Nueva Image Cover",
        content: <NewImageCoverForm {...props} />,
      } );
    },
  };
}
