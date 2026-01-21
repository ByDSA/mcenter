import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { usePlaySmartPlaylistModal } from "./Modal";

export const PlaySmartPlaylistButton = () => {
  const modal = usePlaySmartPlaylistModal();

  return <DaButton
    theme="blue"
    onClick={async ()=> {
      await modal.openModal( {
        initialValue: useBrowserPlayer.getState().query,
      } );
    }}>Reproducir Smart Playlist</DaButton>;
};
