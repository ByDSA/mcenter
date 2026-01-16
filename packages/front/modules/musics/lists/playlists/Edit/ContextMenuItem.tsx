import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useEditPlaylistModal } from "./Modal";

type Props = Parameters<typeof useEditPlaylistModal>[0] & {
  className?: string;
};

export function EditPlaylistContextMenuItem(
  { className, ...useProps }: Props,
) {
  const { openModal } = useEditPlaylistModal(useProps);

  return <ContextMenuItem
    label="Editar"
    className={className}
    onClick={() => openModal()} />;
}
