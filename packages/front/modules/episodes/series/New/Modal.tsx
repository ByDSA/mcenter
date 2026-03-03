import { SeriesEntity } from "$shared/models/episodes/series";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "../NewEditModal.module.css";
import { NewSeriesForm } from "./Form";

type HookProps = {
  onSuccess?: (newData: SeriesEntity)=> void;
};

export function useNewSeriesModal(props: HookProps = {} ) {
  const { LL } = useI18nContext();
  const { openModal: _openModal, ...usingModal } = useModal();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: LL.modules.episodes.series.labels.newTitle(),
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
