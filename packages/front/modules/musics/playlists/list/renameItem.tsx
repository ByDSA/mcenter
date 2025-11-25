import type { useRenamePlaylistModal } from "./useRenamePlaylistModal";
import type { PlaylistEntity } from "../Playlist";
import { createContextMenuItem, useContextMenu } from "#modules/ui-kit/ContextMenu";

type Props = {
  value: PlaylistEntity;
  closeMenu?: ReturnType<typeof useContextMenu>["closeMenu"];
  setValue: (value: PlaylistEntity)=> void;
  renameModal: ReturnType<typeof useRenamePlaylistModal>;
  className?: string;
};

export function RenamePlaylistContextMenuItem(
  { value, setValue, renameModal, className, closeMenu }: Props,
) {
  return createContextMenuItem( {
    label: "Renombrar",
    className,
    closeMenu,
    onClick: (e) => {
      e.preventDefault();
      renameModal.openModal( {
        value,
        setValue,
      } );
    },
  } );
}
