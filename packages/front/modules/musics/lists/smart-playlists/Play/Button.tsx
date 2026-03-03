import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { usePlaySmartPlaylistModal } from "./Modal";

export const PlaySmartPlaylistButton = () => {
  const { LL } = useI18nContext();
  const modal = usePlaySmartPlaylistModal();

  return <DaButton
    theme="blue"
    onClick={async ()=> {
      await modal.openModal( {
        initialValue: useBrowserPlayer.getState().query,
      } );
    }}>{LL.modules.musics.lists.smartPlaylists.play()}</DaButton>;
};
