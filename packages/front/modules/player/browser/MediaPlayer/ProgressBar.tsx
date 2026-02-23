import { ProgressBarView } from "#modules/player/common/ProgressBarView";
import { useBrowserPlayer } from "./BrowserPlayerContext";

type Props = {
  className?: string;
};

export const ProgressBar = ( { className }: Props) => {
  const currentTime = useBrowserPlayer(s=>s.currentTime);
  const duration = useBrowserPlayer(s=>s.duration);
  const setCurrentTime = useBrowserPlayer(s=>s.setCurrentTime);

  return <ProgressBarView
    currentTime={currentTime}
    duration={duration ?? null}
    className={className}
    onSeek={(time)=>{
      setCurrentTime(time, {
        shouldUpdateAudioElement: true,
      } );
    }}
  />;
};
