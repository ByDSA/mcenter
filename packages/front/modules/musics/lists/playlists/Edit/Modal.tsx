import type { MusicPlaylistEntity } from "../models";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { useLocalData } from "#modules/utils/local-data-context";
import { classes } from "#modules/utils/styles";
import styles from "./EditModal.module.css";
import { EditPlaylistForm } from "./Form";

type HookProps = {
  onSuccess?: (props: { previous: MusicPlaylistEntity;
current: MusicPlaylistEntity; } )=> Promise<void> | void;
};

export function useEditPlaylistModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const { data, setData } = useLocalData<MusicPlaylistEntity>();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Editar lista",
      content: (
        <EditPlaylistForm
          initialValue={data}
          updateLocalValue={setData}
          onSuccess={async (v)=>{
            await props.onSuccess?.(v);
            usingModal.closeModal();
          }}
        />
      ),
      ...openProps,
      className: classes(styles.modal, openProps?.className),
    } );
  };

  return {
    ...usingModal,
    openModal,
  };
}
