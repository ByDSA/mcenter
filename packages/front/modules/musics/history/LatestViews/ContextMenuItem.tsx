import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useMusicLatestViewsModal } from "./Modal";

export const MusicLatestViewsContextMenuItem = (
  props: Parameters<typeof useMusicLatestViewsModal>[0],
) => {
  const { openModal } = useMusicLatestViewsModal(props);

  return <ContextMenuItem
    label="Ver últimas reproducciones"
    theme="default"
    onClick={async () => {
      await openModal();
    }}
  />;
};
