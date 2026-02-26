"use client";

import { BackwardButtonView, ForwardButtonView, NextButtonView, PrevButtonView, StopButtonView } from "../common/ControlButtonsView";
import { useRemotePlayer, useRemoteStatus } from "./RemotePlayerContext";

export const RemotePrevButton = () => {
  const { player, resource } = useRemotePlayer();
  const status = useRemoteStatus();

  return <PrevButtonView
    onClick={async ()=>{
      const hasPrev = (status?.playlist?.previous?.length ?? 0) > 0;
      const startTime = resource?.fileInfos?.[0].start ?? 0;
      const currentTime = (status?.time ?? 0) - startTime;

      if (currentTime < 1 && hasPrev)
        await player.previous();
      else
        await player.seek(startTime);
    }}
  />;
};

export const RemoteNextButton = () => {
  const { player } = useRemotePlayer();
  const status = useRemoteStatus();
  const hasNext = (status?.playlist?.next?.length ?? 0) > 0;

  return <NextButtonView
    disabled={!hasNext}
    onClick={()=>player.next()}
  />;
};

export const RemoteBackwardButton = () => {
  const { player } = useRemotePlayer();

  return (
    <BackwardButtonView
      onClick={() => player.seek("-10")}
    />
  );
};

export const RemoteForwardButton = () => {
  const { player } = useRemotePlayer();

  return (
    <ForwardButtonView
      onClick={() => player.seek("+10")}
    />
  );
};

export const RemoteStopButton = () => {
  const { player } = useRemotePlayer();

  return (
    <StopButtonView
      onClick={() => player.stop()}
    />
  );
};
