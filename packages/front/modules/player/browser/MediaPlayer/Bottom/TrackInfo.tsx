import { memo } from "react";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { classes } from "#modules/utils/styles";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import commonStyles from "../MediaPlayerCommon.module.css";
import { CurrentTimeLabel } from "./CurrentTimeLabel";
import styles from "./MediaPlayer.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TrackInfo = memo(
  () => {
    const resource = useBrowserPlayer(s=>s.currentResource);

    if (!resource)
      return null;

    return (
      <div className={styles.trackInfo}>
        <MusicImageCover
          className={commonStyles.imageCover}
          icon={{
            className: commonStyles.icon,
          }}
          img={{
            url: resource.ui.coverImg,
          }}
        />
        <div className={styles.trackDetails}>
          <span
            className={styles.trackTitle}
            title={resource.ui.title}
          >{resource.ui.title}</span>
          <ResourceSubtitle
            className={styles.trackSubtitle}
            items={[
              {
                text: resource.ui.artist,
                className: classes(styles.ellipsisOnSmall),
              },
              resource.ui.album
                ? {
                  className: classes("ellipsis", styles.hideOnSmall),
                  text: resource.ui.album,
                  separatorClassName: styles.hideOnSmall,
                }
                : undefined,
            ]}/>
        </div>
        <CurrentTimeLabel />
      </div>
    );
  },
);
