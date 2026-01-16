import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { Button } from "#modules/ui-kit/input/Button";
import { usePlayQueryModal } from "./Modal";

// eslint-disable-next-line @typescript-eslint/naming-convention
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
