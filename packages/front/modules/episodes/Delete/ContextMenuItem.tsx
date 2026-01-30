import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useDeleteEpisodeModal } from "./Modal";

type Props = Parameters<typeof useDeleteEpisodeModal>[0];

export function DeleteEpisodeContextMenuItem(props: Props) {
  const { openModal } = useDeleteEpisodeModal(props);

  return <ContextMenuItem label="Eliminar" theme="danger" onClick={() => openModal()} />;
}
