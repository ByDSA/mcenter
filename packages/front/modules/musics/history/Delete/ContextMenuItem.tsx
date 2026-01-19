import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useDeleteMusicHistoryEntryModal } from "./Modal";

type Props = Parameters<typeof useDeleteMusicHistoryEntryModal>[0];

export function DeleteHistoryEntryContextMenuItem(
  { onActionSuccess, onFinish }: Props,
) {
  const { openModal } = useDeleteMusicHistoryEntryModal( {
    onActionSuccess,
    onFinish,
  } );

  return <ContextMenuItem
    label="Quitar del historial"
    theme="danger"
    onClick={() => openModal()}
  />;
}
