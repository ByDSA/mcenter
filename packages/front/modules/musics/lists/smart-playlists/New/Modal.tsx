import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { MusicSmartPlaylistEntity } from "../models";
import { NewSmartPlaylistForm } from "./Form";
import modalStyles from "./modal.module.css";

export type NewSmartPlaylistModalProps = {
  onSuccess?: (newSmartPlaylist: MusicSmartPlaylistEntity)=> void;
};

export const useNewSmartPlaylistModal = ( { onSuccess }: NewSmartPlaylistModalProps) => {
  const { LL } = useI18nContext();
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: LL.modules.musics.lists.smartPlaylists.new(),
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
