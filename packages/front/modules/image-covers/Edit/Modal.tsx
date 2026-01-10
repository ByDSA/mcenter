import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ImageCoverEditor, ImageCoverEditorProps } from "./Editor";

export function useImageCoverEditorModal(props: ImageCoverEditorProps) {
  const { openModal, ...usingModal } = useModal();

  return {
    ...usingModal,
    openModal: () => {
      return openModal( {
        title: "Editar Image Cover",
        content: <ImageCoverEditor {...props} />,
      } );
    },
  };
}
