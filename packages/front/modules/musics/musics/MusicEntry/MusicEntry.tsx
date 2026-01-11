import { memo, ReactNode } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { MusicEntity } from "$shared/models/musics";
import { useShallow } from "zustand/react/shallow";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { useUser } from "#modules/core/auth/useUser";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { DurationView, WeightView } from "#modules/history";
import { classes } from "#modules/utils/styles";
import { ResourceEntry, ResourceEntryProps, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useMusic } from "#modules/musics/hooks";
import { ResourceEntryLoading } from "#modules/resources/ResourceEntryLoading";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { getMediumCoverUrl, getSmallCoverUrl } from "#modules/image-covers/Selector/image-cover-utils";
import styles from "./MusicEntry.module.css";
import { genMusicEntryContextMenuContent } from "./ContextMenu";

type Props = Pick<ResourceEntryProps, "drag"> & {
  musicId: string;
  contextMenu?: {
    customContent: ReactNode;
  };
  playable?: boolean;
  onClickPlay?: (prevStatus: PlayerStatus)=> Promise<void> | void;
  playlistInfo?: {
    index: number;
    playlist: MusicPlaylistEntity | null; // null = play queue
  };
};
export function MusicEntryElement(
  props: Props,
) {
  const { user } = useUser();
  const { openMenu } = useContextMenuTrigger();
  const { musicId } = props;
  const { data: music } = useMusic(musicId);
  let play: Parameters<typeof ResourceEntry>[0]["play"];
  const player = useBrowserPlayer(useShallow((s) => ( {
    currentResource: s.currentResource,
    status: s.status,
    playMusic: s.playMusic,
    playPlaylistItem: s.playPlaylistItem,
    playQueueIndex: s.playQueueIndex,
    resume: s.resume,
    pause: s.pause,
    queue: s.queue,
    audioElement: s.audioElement,
  } )));

  if (!music)
    return <ResourceEntryLoading />;

  const duration = music.fileInfos?.[0]?.mediaInfo.duration;
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const right = <>
    {duration && <DurationView duration={duration} />}
    {music.userInfo && <WeightView weight={music.userInfo.weight} />}
  </>;

  if (props.playable) {
    const playingThisMusicStatus = (()=>{
      if (props.playlistInfo) {
        let itemId: string | null;
        const { index } = props.playlistInfo;

        if (props.playlistInfo.playlist)
          itemId = props.playlistInfo.playlist.list[index].id;
        else
          itemId = player.queue[index].itemId;

        if (itemId === player.currentResource?.itemId)
          return player.status;
        else
          return "stopped";
      }

      if (player.currentResource?.type !== "music")
        return "stopped";

      if (player.currentResource?.resourceId !== music.id)
        return "stopped";

      return player.status;
    } )();

    play = {
      status: playingThisMusicStatus,
      onClick: async ()=>{
        if (playingThisMusicStatus === "playing")
          player.pause();
        else if (playingThisMusicStatus === "paused")
          player.resume();
        else if (props.playlistInfo) {
          const { playlist, index } = props.playlistInfo;

          if (playlist) {
            await player.playPlaylistItem( {
              playlist,
              index,
              ownerSlug: playlist.ownerUser?.slug,
            } );
          } else
            await player.playQueueIndex(index);
        } else
          await player.playMusic(music.id);

        await props.onClickPlay?.(player.status);
      },
    };
  }

  return <ResourceEntry
    title={music.title}
    titleHref={PATH_ROUTES.musics.frontend.path + "/" + music.id}
    subtitle={<MusicSubtitle
      music={music}
    />}
    coverUrl={getSmallCoverUrlFromMusic(music)}
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
    play={play}
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

export function getSmallCoverUrlFromMusic(music: MusicEntity) {
  if (music.imageCover)
    return getSmallCoverUrl(music.imageCover);

  return undefined;
}

export function getMediumCoverUrlFromMusic(music: MusicEntity) {
  if (music.imageCover)
    return getMediumCoverUrl(music.imageCover);

  return undefined;
}
