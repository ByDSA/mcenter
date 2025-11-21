import type { useRenamePlaylistModal } from "./useRenamePlaylistModal";
import type { PlaylistEntity } from "../Playlist";

type Props = {
  value: PlaylistEntity;
  setValue: (value: PlaylistEntity)=> void;
  renameModal: ReturnType<typeof useRenamePlaylistModal>;
  className?: string;
};

export function RenamePlaylistContextMenuItem( { value, setValue, renameModal, className }: Props) {
  return (
    <>
      <p
        className={className}
        onClick={(e) => {
          e.preventDefault();
          renameModal.open( {
            value,
            setValue,
          } );
        }}
      >
      Renombrar
      </p>
      {renameModal.element}
    </>
  );
}
