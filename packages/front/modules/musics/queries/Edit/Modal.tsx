import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { useLocalData } from "#modules/utils/local-data-context";
import { classes } from "#modules/utils/styles";
import { MusicQueryEntity } from "../models";
import styles from "../../playlists/list/EditModal.module.css";
import { EditQueryForm } from "./Form";

type HookProps = {
  onSuccess?: (props: { previous: MusicQueryEntity;
  current: MusicQueryEntity; } )=> Promise<void> | void;
};

export function useEditQueryModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const { data: value, setData: setValue } = useLocalData<MusicQueryEntity>();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Editar Query",
      content: (
        <EditQueryForm
          initialValue={value}
          updateLocalValue={setValue}
          onSuccess={async (v) => {
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
