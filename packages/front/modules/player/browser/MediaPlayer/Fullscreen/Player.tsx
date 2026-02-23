import { useMusic } from "#modules/musics/hooks";
import { PlayerView } from "#modules/player/common/PlayerView";
import { secsToMmss } from "#modules/utils/dates";
import { PlayButton } from "../PlayButton";
import { PrevButton, NextButton, ShuffleButton, RepeatButton, BackwardButton, ForwardButton, CloseButton } from "../OtherButtons";
import { ProgressBar } from "../ProgressBar";
import { useBrowserPlayer } from "../BrowserPlayerContext";

export const Player = () => {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const { data: music } = useMusic(currentResource?.resourceId ?? null);

  if (!music)
    return null;

  const { title, artist } = music;

  return <PlayerView
    artist={artist}
    title={title}
    cover={music.imageCover}
    progressBar={<ProgressBar />}
    currentTime={<CurrentTime />}
    duration={<Duration />}
    controls={{
      backward: <BackwardButton />,
      prev: <PrevButton />,
      play: <PlayButton />,
      next: <NextButton />,
      forward: <ForwardButton />,
      shuffle: <ShuffleButton />,
      repeat: <RepeatButton />,
      close: <CloseButton />,
    }}
  />;
};

const CurrentTime = () => {
  const currentTime = useBrowserPlayer(s=>s.currentTime);

  return <span>{secsToMmss(currentTime)}</span>;
};
const Duration = () => {
  const duration = useBrowserPlayer(s=>s.duration);

  return <span>{secsToMmss(duration ?? null)}</span>;
};
