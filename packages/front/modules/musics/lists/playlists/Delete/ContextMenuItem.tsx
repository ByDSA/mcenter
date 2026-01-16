import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useDeletePlayListModal } from "./Modal";

type Props = Parameters<typeof useDeletePlayListModal>[0];

export function DeletePlaylistContextMenuItem(
  { onActionSuccess, onFinish }: Props,
) {
  const { openModal } = useDeletePlayListModal( {
    onActionSuccess,
    onFinish,
  } );

  return <ContextMenuItem
    label="Eliminar"
    theme="danger"
    onClick={()=> openModal()} />;
}
