import { memo, ReactNode } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity } from "$shared/models/musics";
import { useUser } from "#modules/core/auth/useUser";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { DurationView, WeightView } from "#modules/history";
import { classes } from "#modules/utils/styles";
import { ResourceEntry, ResourceEntryProps, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useMusic } from "#modules/musics/hooks";
import { ResourceEntryLoading } from "#modules/resources/ResourceEntryLoading";
import styles from "./MusicEntry.module.css";
import { genMusicEntryContextMenuContent } from "./ContextMenu";

type Props = Pick<ResourceEntryProps, "drag" | "play"> & {
  musicId: string;
  index?: number;
  contextMenu?: {
    customContent: ReactNode;
  };
};
export function MusicEntryElement(
  props: Props,
) {
  const { user } = useUser();
  const { openMenu } = useContextMenuTrigger();
  const { musicId } = props;
  const { data: music } = useMusic(musicId);

  if (!music)
    return <ResourceEntryLoading />;

  const duration = music.fileInfos?.[0]?.mediaInfo.duration;
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const right = <>
    {duration && <DurationView duration={duration} />}
    {music.userInfo && <WeightView weight={music.userInfo.weight} />}
  </>;

  return <ResourceEntry
    index={props.index}
    title={music.title}
    titleHref={PATH_ROUTES.musics.frontend.path + "/" + music.id}
    subtitle={<MusicSubtitle
      music={music}
    />}
    coverUrl={music.coverUrlSmall ?? music.coverUrl}
    favButton={ <PlaylistFavButton
      favoritesPlaylistId={favoritesPlaylistId}
      musicId={music.id}
    />}
    right={right}
    settings={{
      onClick: (e)=>openMenu( {
        event: e,
        content: props.contextMenu?.customContent ?? genMusicEntryContextMenuContent( {
          music,
          user,
        } ),
      } ),
    }}
    play={props.play}
    drag={props.drag}
  />;
}

type MusicSubtitleProps = {
  music: MusicEntity;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicSubtitle = memo(( { music }: MusicSubtitleProps) => {
  return <ResourceSubtitle items={[{
    text: music.game ?? music.artist,
    className: styles.artist,
  }, music.album
    ? {
      text: music.album,
      className: classes("ellipsis", styles.albumShowHide),
      separatorClassName: styles.albumShowHide,
    }
    : undefined,

  ]} />;
} );
