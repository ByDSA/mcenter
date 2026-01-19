import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ImageCoverEditorForm, ImageCoverEditorProps } from "./Form";

export function useImageCoverEditorModal(props: ImageCoverEditorProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Editar Image Cover",
        content: <ImageCoverEditorForm {...props} />,
      } );
    },
  };
}
