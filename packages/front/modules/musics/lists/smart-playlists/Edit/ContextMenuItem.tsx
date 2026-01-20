import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useEditSmartPlaylistModal } from "./Modal";

type Props = Parameters<typeof useEditSmartPlaylistModal>[0] & {
  className?: string;
};

export function EditSmartPlaylistContextMenuItem( { className, ...useProps }: Props) {
  const { openModal } = useEditSmartPlaylistModal(useProps);

  return <ContextMenuItem
    label="Editar"
    className={className}
    onClick={()=>openModal()} />;
}
