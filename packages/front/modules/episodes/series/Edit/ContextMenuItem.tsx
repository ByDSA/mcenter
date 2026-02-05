import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useEditSeriesModal } from "./Modal";

type Props = Parameters<typeof useEditSeriesModal>[0];

export function EditSeriesContextMenuItemCurrentCtx(props: Props) {
  const { openModal } = useEditSeriesModal(props);

  return <ContextMenuItem label="Editar" onClick={() => openModal()} />;
}
