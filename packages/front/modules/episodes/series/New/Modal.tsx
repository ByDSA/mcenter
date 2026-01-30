import { SeriesEntity } from "$shared/models/episodes/series";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import styles from "../NewEditModal.module.css";
import { NewSeriesForm } from "./Form";

type HookProps = {
  onSuccess?: (newData: SeriesEntity)=> void;
};

export function useNewSeriesModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Nueva serie",
      className: styles.modal,
      content: (
        <NewSeriesForm
          onSuccess={(v) => {
            props.onSuccess?.(v);
            usingModal.closeModal();
          }}
        />
      ),
      ...openProps,
    } );
  };

  return {
    ...usingModal,
    openModal,
  };
}
