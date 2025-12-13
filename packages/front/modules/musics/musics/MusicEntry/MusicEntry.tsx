import { memo, useCallback } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { Music, MusicEntity } from "$shared/models/musics";
import { logger } from "#modules/core/logger";
import { frontendUrl } from "#modules/requests";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { AddToPlaylistContextMenuItem } from "#modules/musics/playlists/AddToPlaylistContextMenuItem";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { DurationView, WeightView } from "#modules/history";
import { classes } from "#modules/utils/styles";
import { ResourceEntry } from "#modules/resources/ResourceEntry";
import listEntryStyles from "#modules/resources/ListEntry.module.css";
import { MusicLatestViewsContextMenuItem } from "#modules/musics/history/LatestViews/ContextMenuItem";
import { BodyProps } from "../EditMusic/EditMusic";
import { EditMusicContextMenuItem } from "../EditMusic/ContextMenu";
import styles from "./MusicEntry.module.css";

type Props = BodyProps & {
  index?: number;
};
export function MusicEntryElement(
  props: Props,
) {
  const { data: music } = props;
  const { openMenu } = useContextMenuTrigger();
  const { user } = useUser();
  const duration = music.fileInfos?.[0]?.mediaInfo.duration;
  const onClickMenu = useCallback((e)=> {
    openMenu( {
      event: e,
      content: (
        <>
          {
            user && <AddToPlaylistContextMenuItem
              musicId={music.id}
              user={user}
            />
          }
          <EditMusicContextMenuItem
            initialData={music}
            setData={a=>props.setData(a)}
          />
          {
            user && <MusicLatestViewsContextMenuItem
              music={music}
              musicId={music.id}
            />
          }
          <CopyMusicMenuItem
            music={music}
            token={user?.id}
          />
        </>
      ),
    } );
  }, []);
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
      onClick: onClickMenu,
    }}
    play={{
      isPlaying: false,
      // eslint-disable-next-line no-empty-function
      onClick: ()=>{},
    }}
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

type CopyMusicMenuItemProps = {
  music: MusicEntity;
  token?: string;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const CopyMusicMenuItem = (props: CopyMusicMenuItemProps) => {
  return <ContextMenuItem
    label="Copiar enlace"
    onClick={async (event) => {
      event.stopPropagation();
      await copyMusicUrl( {
        music: props.music,
        token: props.token,
      } );
    }}
  />;
};

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
