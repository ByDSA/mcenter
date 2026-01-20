import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { usePlaySmartPlaylistModal } from "./Modal";

export const PlayQueryButton = () => {
  const modal = usePlaySmartPlaylistModal();

  return <Button
    theme="blue"
    onClick={async ()=> {
      await modal.openModal( {
        initialValue: useBrowserPlayer.getState().query,
      } );
    }}>Reproducir query</Button>;
};
