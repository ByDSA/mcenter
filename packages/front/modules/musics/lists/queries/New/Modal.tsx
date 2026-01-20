import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicQueryEntity } from "../models";
import { NewQueryForm } from "./Form";
import modalStyles from "./modal.module.css";

export type NewQueryModalProps = {
  onSuccess?: (newQuery: MusicQueryEntity)=> void;
};

export const useNewQueryModal = ( { onSuccess }: NewQueryModalProps) => {
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: "Nueva Query",
      className: modalStyles.modal,
      content: (
        <NewQueryForm
          onSuccess={(v) => {
            onSuccess?.(v);
            usingModal.closeModal();
          }}
        />
      ),
    } );
  };

  return {
    ...usingModal,
    openModal,
  };
};
