import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { NewPlaylistModalProps, useNewPlaylistModal } from "./Modal";

export const NewPlaylistContextMenuItem = ( { onSuccess }: NewPlaylistModalProps) => {
  const { openModal } = useNewPlaylistModal( {
    onSuccess,
  } );

  return (
    <ContextMenuItem
      onClick={()=>openModal()}
      label="Nueva playlist"
    />
  );
};
