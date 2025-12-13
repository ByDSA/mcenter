import type { PlaylistEntity } from "../Playlist";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useRenamePlaylistModal } from "./useRenamePlaylistModal";

type Props = Parameters<typeof useRenamePlaylistModal>[0] & {
  value: PlaylistEntity;
  setValue: (value: PlaylistEntity)=> void;
  className?: string;
};

export function RenamePlaylistContextMenuItem(
  { value, setValue, className, ...useProps }: Props,
) {
  const { openModal } = useRenamePlaylistModal(useProps);

  return ContextMenuItem( {
    label: "Renombrar",
    className,
    onClick: () => {
      return openModal( {
        value,
        setValue,
      } );
    },
  } );
}
