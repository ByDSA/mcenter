import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import { usePlayQueryModal } from "./Modal";

export const PlayQueryButton = () => {
  const modal = usePlayQueryModal();

  return <Button
    theme="blue"
    onClick={async ()=> {
      await modal.openModal( {
        initialValue: useBrowserPlayer.getState().query,
      } );
    }}>Reproducir query</Button>;
};
