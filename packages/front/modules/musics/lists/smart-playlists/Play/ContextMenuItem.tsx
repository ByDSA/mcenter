import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { usePlaySmartPlaylistModal } from "./Modal";

type Props = Parameters<ReturnType<typeof usePlaySmartPlaylistModal>["openModal"]>[0] & {
  label?: string;
};

export const PlaySmartPlaylistContextMenuItem = (props?: Props) => {
  const { LL } = useI18nContext();
  const playQueryModal = usePlaySmartPlaylistModal();

  return <ContextMenuItem
    label={props?.label ?? LL.modules.musics.lists.smartPlaylists.play()}
    onClick={async ()=> {
      await playQueryModal.openModal(props);
    }}
  />;
};
