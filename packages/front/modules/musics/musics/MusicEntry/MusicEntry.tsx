import { memo, ReactNode } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { Music, MusicEntity } from "$shared/models/musics";
import { logger } from "#modules/core/logger";
import { frontendUrl } from "#modules/requests";
import { useUser } from "#modules/core/auth/useUser";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { DurationView, WeightView } from "#modules/history";
import { classes } from "#modules/utils/styles";
import { ResourceEntry, ResourceEntryProps } from "#modules/resources/ResourceEntry";
import listEntryStyles from "#modules/resources/ListEntry.module.css";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { BodyProps } from "../EditMusic/EditMusic";
import styles from "./MusicEntry.module.css";
import { genMusicEntryContextMenuContent } from "./ContextMenu";

type Props = BodyProps & Pick<ResourceEntryProps, "drag"> & {
  index?: number;
  contextMenu?: {
    customContent: ReactNode;
  };
};
export function MusicEntryElement(
  props: Props,
) {
  const { data: music } = props;
  const duration = music.fileInfos?.[0]?.mediaInfo.duration;
  const { user } = useUser();
  const { openMenu } = useContextMenuTrigger();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const right = <>
    {duration && <DurationView duration={duration} />}
    {music.userInfo && <WeightView weight={music.userInfo.weight} />}
  </>;

  return <ResourceEntry
    index={props.index}
    title={music.title}
    subtitle={<MusicSubtitle
      music={music}
    />}
    favButton={ PlaylistFavButton( {
      favoritesPlaylistId,
      initialValue: music.isFav,
      musicId: music.id,
    } )}
    right={right}
    settings={{
      onClick: (e)=>openMenu( {
        event: e,
        content: props.contextMenu?.customContent ?? genMusicEntryContextMenuContent( {
          music,
          setMusic: props.setData,
          user,
        } ),
      } ),
    }}
    play={{
      isPlaying: false,
      // eslint-disable-next-line no-empty-function
      onClick: ()=>{},
    }}
    drag={props.drag}
  />;
}

type CopyMusicProps = {
  music: Music;
  token?: string;
};
export async function copyMusicUrl( { music, token }: CopyMusicProps) {
  await navigator.clipboard.writeText(
    frontendUrl(
      PATH_ROUTES.musics.frontend.slug.withParams( {
        slug: music.slug,
        token: token,
      } ),
    ),
  );
  logger.info("Copiada url");
}

type MusicSubtitleProps = {
  music: MusicEntity;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicSubtitle = memo(( { music }: MusicSubtitleProps) => {
  return <>
    <span className={classes(styles.artist)}>{music.game ?? music.artist}</span>
    {music.album
      && <>
        <span className={classes(listEntryStyles.separator, styles.albumShowHide)}>•</span>
        <span className={classes("ellipsis", styles.albumShowHide)}>{music.album}</span>
      </>
    }
  </>;
} );
