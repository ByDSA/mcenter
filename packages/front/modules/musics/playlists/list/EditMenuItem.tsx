import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { MusicPlaylistEntity } from "../models";
import { useEditPlaylistModal } from "./EditModal";

type Props = Parameters<typeof useEditPlaylistModal>[0] & {
  value: MusicPlaylistEntity;
  setValue: (value: MusicPlaylistEntity)=> void;
  className?: string;
};

export function EditPlaylistContextMenuItem(
  { value, setValue, className, ...useProps }: Props,
) {
  const { openModal } = useEditPlaylistModal(useProps);

  return ContextMenuItem( {
    label: "Editar",
    className,
    onClick: () => {
      return openModal( {
        value,
        setValue,
      } );
    },
  } );
}
