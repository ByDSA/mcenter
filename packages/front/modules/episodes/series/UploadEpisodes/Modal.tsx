import type { UploadEpisodesContextMenuItemCurrentCtx } from "./ContextMenuItem";
import { SeriesEntity } from "$shared/models/episodes/series";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { PropsOf } from "#modules/utils/react";
import styles from "../NewEditModal.module.css";
import { UploadEpisodesForm } from "./Form";

type Props = PropsOf<typeof UploadEpisodesContextMenuItemCurrentCtx>;

export function useUploadEpisodesModal(props: Props) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const { data, setData } = useLocalData<SeriesEntity>();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Subir episodios",
      className: styles.modal,
      content: (
        <LocalDataProvider data={data} setData={setData}>
          <UploadEpisodesForm {...props} />
        </LocalDataProvider>
      ),
      ...openProps,
    } );
  };

  return {
    ...usingModal,
    openModal,
  };
}
