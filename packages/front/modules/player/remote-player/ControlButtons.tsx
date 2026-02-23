"use client";

import { BackwardButtonView, ForwardButtonView, NextButtonView, PrevButtonView, StopButtonView } from "../common/ControlButtonsView";
import { useRemotePlayer, useRemoteStatus } from "./RemotePlayerContext";

export const RemotePrevButton = () => {
  const { player } = useRemotePlayer();
  const status = useRemoteStatus();
  const hasPrev = (status?.playlist?.previous?.length ?? 0) > 0;

  return <PrevButtonView
    disabled={!hasPrev}
    onClick={()=>player.previous()}
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
