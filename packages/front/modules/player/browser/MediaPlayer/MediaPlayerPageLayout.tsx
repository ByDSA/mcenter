"use client";

import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import { BottomMediaPlayer } from "./Bottom/MediaPlayer";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import { AudioTag } from "./Audio/AudioTag";
import { WindowProvider } from "./Bottom/PlayQueue/WindowProvider";

type Props = {
  children: ReactNode;
};
export const MediaPlayerPageLayout = (props: Props) => {
  return <>
    <MediaPlayerPageLayoutContent {...props} />
  </>;
};

function MediaPlayerPageLayoutContent( { children }: Props) {
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  const hasCurrentResource = currentResource !== null;

  return <><div className={classes(hasCurrentResource
    && "mcenter-media-player-open")}>{children}</div>
  {hasCurrentResource && <MediaPlayer />}
  </>;
}

const MediaPlayer = () => {
  return <>
    <AudioTag />
    <WindowProvider>
      <BottomMediaPlayer />
    </WindowProvider>
  </>;
};
