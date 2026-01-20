import { assertIsDefined } from "$shared/utils/validation";
import { OpenModalProps, useModal } from "#modules/ui-kit/modal/ModalContext";
import { useLocalData } from "#modules/utils/local-data-context";
import { classes } from "#modules/utils/styles";
import { MusicSmartPlaylistEntity } from "../models";
import styles from "./Modal.module.css";
import { EditSmartPlaylistForm } from "./Form";

type HookProps = {
  onSuccess?: (props: { previous: MusicSmartPlaylistEntity;
  current: MusicSmartPlaylistEntity; } )=> Promise<void> | void;
};

export function useEditSmartPlaylistModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const { data, setData } = useLocalData<MusicSmartPlaylistEntity>();

  assertIsDefined(setData);
  const openModal = (openProps?: OpenModalProps) => {
    return _openModal( {
      title: "Editar Smart Playlist",
      content: (
        <EditSmartPlaylistForm
          initialData={data}
          updateLocalData={setData}
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
