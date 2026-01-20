import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicSmartPlaylistEntity } from "../models";
import { NewSmartPlaylistForm } from "./Form";
import modalStyles from "./modal.module.css";

export type NewSmartPlaylistModalProps = {
  onSuccess?: (newSmartPlaylist: MusicSmartPlaylistEntity)=> void;
};

export const useNewSmartPlaylistModal = ( { onSuccess }: NewSmartPlaylistModalProps) => {
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: "Nueva Smart Playlist",
      className: modalStyles.modal,
      content: (
        <NewSmartPlaylistForm
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
