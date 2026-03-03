import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { NewSmartPlaylistModalProps, useNewSmartPlaylistModal } from "./Modal";

export const NewSmartPlaylistContextMenuItem = ( { onSuccess }: NewSmartPlaylistModalProps) => {
  const { LL } = useI18nContext();
  const { openModal } = useNewSmartPlaylistModal( {
    onSuccess,
  } );

  return (
    <ContextMenuItem
      onClick={()=>openModal()}
      label={LL.modules.musics.lists.smartPlaylists.new()}
    />
  );
};
