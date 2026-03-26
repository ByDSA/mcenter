import { useShallow } from "zustand/react/shallow";
import { BackwardButtonView, CloseButtonView, ForwardButtonView, NextButtonView, PrevButtonView, RepeatButtonView, ShuffleButtonView } from "#modules/player/common/ControlButtonsView";
import { useBrowserPlayer } from "./BrowserPlayerContext";

export const RepeatButton = () => {
  const { cycleRepeatMode, repeatMode } = useBrowserPlayer(useShallow(s => ( {
    cycleRepeatMode: s.cycleRepeatMode,
    repeatMode: s.repeatMode,
  } )));

  return (
    <RepeatButtonView
      repeatMode={repeatMode}
      onClick={()=>{
        cycleRepeatMode();
      }}
    />
  );
};

export const ShuffleButton = () => {
  const { isShuffle, setIsShuffle,
    setNextResource } = useBrowserPlayer(useShallow(s => ( {
    isShuffle: s.isShuffle,
    setIsShuffle: s.setIsShuffle,
    setNextResource: s.setNextResource,
  } )));
  const query = useBrowserPlayer(s=>s.query);
  const currentResource = useBrowserPlayer(s=>s.currentResource);

  return (
    <ShuffleButtonView
      isShuffle={isShuffle}
      disabled={!!query && currentResource?.playlistId === null}
      onClick={() => {
        setIsShuffle(!isShuffle);
        setNextResource(null);
      }}
    />
  );
};

export const BackwardButton = ( { className }: {className?: string} ) => {
  const audioElement = useBrowserPlayer(s=>s.audioElement);

  return <BackwardButtonView
    className={className}
    disabled={!audioElement}
    onClick={() => {
      const { backward } = useBrowserPlayer.getState();

      backward(10);
    }}
  />;
};

export const ForwardButton = ( { className }: {className?: string} ) => {
  const audioElement = useBrowserPlayer(s=>s.audioElement);

  return <ForwardButtonView
    className={className}
    disabled={!audioElement}
    onClick={() => {
      const { forward } = useBrowserPlayer.getState();

      forward(10);
    }}
  />;
};

export const CloseButton = ( { className }: {className?: string} ) => {
  return <CloseButtonView
    className={className}
    onClick={() => {
      const { close } = useBrowserPlayer.getState();

      close();
    }}
  />;
};

export const PrevButton = ( { className }: {className?: string} ) => {
  return <PrevButtonView
    className={className}
    onClick={async () => {
      const { currentTime, hasPrev, setCurrentTime, prev } = useBrowserPlayer.getState();

      if (currentTime < 1 && hasPrev())
        await prev();
      else {
        setCurrentTime(0, {
          shouldUpdateAudioElement: true,
        } );
      }
    }}

  />;
};
type NextButtonProps = {
className?: string;
};
export const NextButton = ( { className }: NextButtonProps) => {
  const next = useBrowserPlayer(s=>s.next);
  const hasNext = useBrowserPlayer(s=>s.hasNext);
  // Porque hasNext depende de isShuffle, repeatMode y priorityQueue
  // eslint-disable-next-line no-underscore-dangle
  const _1 = useBrowserPlayer(s=>s.isShuffle);
  // eslint-disable-next-line no-underscore-dangle
  const _2 = useBrowserPlayer(s=>s.repeatMode);
  // eslint-disable-next-line no-underscore-dangle
  const _3 = useBrowserPlayer(s=>s.priorityQueue);

  return <NextButtonView
    className={className}
    disabled={!hasNext()}
    onClick={() => next()}

  />;
};
