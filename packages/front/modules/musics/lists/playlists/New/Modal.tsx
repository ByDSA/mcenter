import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { MusicPlaylistEntity } from "../models";
import { NewPlaylistForm } from "./Form";

export type NewPlaylistModalProps = {
  onSuccess?: (newPlaylist: MusicPlaylistEntity)=> void;
};

export const useNewPlaylistModal = ( { onSuccess }: NewPlaylistModalProps) => {
  const { LL } = useI18nContext();
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: LL.modules.musics.lists.playlists.new(),
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
