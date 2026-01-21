import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { usePlaySmartPlaylistModal } from "./Modal";

type Props = Parameters<ReturnType<typeof usePlaySmartPlaylistModal>["openModal"]>[0] & {
  label?: string;
};

export const PlaySmartPlaylistContextMenuItem = (props?: Props) => {
  const playQueryModal = usePlaySmartPlaylistModal();

  return <ContextMenuItem
    label={props?.label ?? "Reproducir Smart Playlist"}
    onClick={async ()=> {
      await playQueryModal.openModal(props);
    }}
  />;
};
