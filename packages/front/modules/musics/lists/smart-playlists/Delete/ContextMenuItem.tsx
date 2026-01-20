import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useDeleteSmartPlaylistModal } from "./Modal";

type Props = Parameters<typeof useDeleteSmartPlaylistModal>[0];

export function DeleteSmartPlaylistContextMenuItem(
  { onActionSuccess, onFinish }: Props,
) {
  const { openModal } = useDeleteSmartPlaylistModal( {
    onActionSuccess,
    onFinish,
  } );

  return <ContextMenuItem
    label="Eliminar"
    theme="danger"
    onClick={() => openModal()}
  />;
}
