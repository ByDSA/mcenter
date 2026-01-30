import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useDeleteSeriesModal } from "./Modal";

type Props = Parameters<typeof useDeleteSeriesModal>[0];

export function DeleteSeriesContextMenuItem(props: Props) {
  const { openModal } = useDeleteSeriesModal(props);

  return <ContextMenuItem label="Eliminar" theme="danger" onClick={() => openModal()} />;
}
