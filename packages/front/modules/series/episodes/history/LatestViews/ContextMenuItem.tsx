import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useEpisodeLatestViewsModal } from "./Modal";

export const EpisodeLatestViewsContextMenuItem = (
  props: Parameters<typeof useEpisodeLatestViewsModal>[0],
) => {
  const { openModal } = useEpisodeLatestViewsModal(props);

  return <ContextMenuItem
    label="Ver últimas reproducciones"
    theme="default"
    onClick={async () => {
      await openModal();
    }}
  />;
};
