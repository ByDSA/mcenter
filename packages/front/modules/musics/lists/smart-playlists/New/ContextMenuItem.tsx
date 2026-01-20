import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { NewSmartPlaylistModalProps, useNewSmartPlaylistModal } from "./Modal";

export const NewSmartPlaylistContextMenuItem = ( { onSuccess }: NewSmartPlaylistModalProps) => {
  const { openModal } = useNewSmartPlaylistModal( {
    onSuccess,
  } );

  return (
    <ContextMenuItem
      onClick={()=>openModal()}
      label="Nueva Smart Playlist"
    />
  );
};
