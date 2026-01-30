import { SeriesEntity } from "$shared/models/episodes/series";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { useLocalData } from "#modules/utils/local-data-context";
import styles from "../NewEditModal.module.css";
import { EditSeriesForm } from "./Form";

type HookProps = {
  onSuccess?: (newData: SeriesEntity)=> void;
};

export function useEditSeriesModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const { data } = useLocalData<SeriesEntity>();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Editar serie",
      className: styles.modal,
      content: (
        <EditSeriesForm
          initialData={data}
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
