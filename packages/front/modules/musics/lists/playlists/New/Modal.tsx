import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicPlaylistEntity } from "../models";
import { NewPlaylistForm } from "./Form";

export type NewPlaylistModalProps = {
  onSuccess?: (newPlaylist: MusicPlaylistEntity)=> void;
};

export const useNewPlaylistModal = ( { onSuccess }: NewPlaylistModalProps) => {
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: "Nueva lista",
      content: (
        <NewPlaylistForm
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
