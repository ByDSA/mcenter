"use client";

/* eslint-disable @typescript-eslint/naming-convention */
import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import { BottomMediaPlayer } from "./Bottom/MediaPlayer";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./MediaPlayerPageLayout.module.css";
import { AudioTag } from "./AudioTag";
import { AudioProvider } from "./AudioContext";

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
    && styles.layout)}>{children}</div>
  {hasCurrentResource && <MediaPlayer />}
  </>;
}

const MediaPlayer = () => {
  return <AudioProvider>
    <AudioTag />
    <BottomMediaPlayer />
  </AudioProvider>;
};
