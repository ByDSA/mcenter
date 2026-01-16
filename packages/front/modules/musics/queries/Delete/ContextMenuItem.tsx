import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useDeleteQueryModal } from "./Modal";

type Props = Parameters<typeof useDeleteQueryModal>[0];

export function DeleteQueryContextMenuItem(
  { onActionSuccess, onFinish }: Props,
) {
  const { openModal } = useDeleteQueryModal( {
    onActionSuccess,
    onFinish,
  } );

  return <ContextMenuItem
    label="Eliminar"
    theme="danger"
    onClick={() => openModal()}
  />;
}
