import { memo } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { useRouter } from "next/navigation";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { classes } from "#modules/utils/styles";
import { useMusic } from "#modules/musics/hooks";
import { ContentSpinner } from "#modules/ui-kit/spinner/Spinner";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import commonStyles from "../MediaPlayerCommon.module.css";
import { CurrentTimeLabel } from "./CurrentTimeLabel";
import styles from "./MediaPlayer.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TrackInfo = memo(
  () => {
    const resource = useBrowserPlayer(s=>s.currentResource);
    const router = useRouter();
    const { data: music } = useMusic(resource!.resourceId);

    if (!music)
      return <ContentSpinner size={2}/>;

    return (
      <div className={styles.trackInfo}>
        <MusicImageCover
          className={commonStyles.imageCover}
          icon={{
            className: commonStyles.icon,
          }}
          img={{
            url: music.coverUrl,
          }}
        />
        <div className={styles.trackDetails}>
          <a
            className={styles.trackTitle}
            title={music.title}
            onClick={()=> {
              router.push(PATH_ROUTES.musics.frontend.path + "/" + music.id);
            }}
          >{music.title}</a>
          <ResourceSubtitle
            className={styles.trackSubtitle}
            items={[
              {
                text: music.artist,
                className: classes(styles.ellipsisOnSmall),
              },
              music.album
                ? {
                  className: classes("ellipsis", styles.hideOnSmall),
                  text: music.album,
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
