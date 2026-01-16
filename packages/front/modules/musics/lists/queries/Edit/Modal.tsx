import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { useLocalData } from "#modules/utils/local-data-context";
import { classes } from "#modules/utils/styles";
import { MusicQueryEntity } from "../models";
import styles from "./Modal.module.css";
import { EditQueryForm } from "./Form";

type HookProps = {
  onSuccess?: (props: { previous: MusicQueryEntity;
  current: MusicQueryEntity; } )=> Promise<void> | void;
};

export function useEditQueryModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const { data, setData } = useLocalData<MusicQueryEntity>();
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Editar query",
      content: (
        <EditQueryForm
          initialValue={data}
          updateLocalValue={setData}
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
