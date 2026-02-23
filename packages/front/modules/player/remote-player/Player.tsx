"use client";

import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import commonStyles from "../common/MediaPlayerCommon.module.css";
import { PlayerView } from "../common/PlayerView";
import { CloseButtonView, RepeatButtonView, ShuffleButtonView } from "../common/ControlButtonsView";
import { useRemoteCover, useRemoteTitle, useRemoteArtist } from "./RemotePlayerContext";
import { RemotePlayButton } from "./PlayButton";
import { RemotePrevButton,
  RemoteNextButton,
  RemoteBackwardButton,
  RemoteForwardButton } from "./ControlButtons";
import { RemoteProgressBar, RemoteCurrentTime, RemoteDuration } from "./ProgressBar";

export const RemotePlayer = () => {
  const cover = useRemoteCover();
  const title = useRemoteTitle();
  const artist = useRemoteArtist();

  return <PlayerView
    artist={artist}
    title={title}
    cover={cover}
    coverIcon={{
      element: <SeriesIcon />,
      className: commonStyles.icon,
    }}
    progressBar={<RemoteProgressBar />}
    currentTime={<RemoteCurrentTime />}
    duration={<RemoteDuration />}
    controls={{
      backward: <RemoteBackwardButton />,
      prev: <RemotePrevButton />,
      play: <RemotePlayButton />,
      next: <RemoteNextButton />,
      forward: <RemoteForwardButton />,
      shuffle: <ShuffleButtonView isShuffle={false} disabled />,
      repeat: <RepeatButtonView repeatMode={0} disabled />,
      close: <CloseButtonView disabled/>,
    }}
  />;
};
