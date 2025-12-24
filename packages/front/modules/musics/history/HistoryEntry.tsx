import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useUser } from "#modules/core/auth/useUser";
import { HistoryTimeView, WeightView } from "#modules/history";
import { MusicSubtitle } from "#modules/musics/musics/MusicEntry/MusicEntry";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { ResourceEntry } from "#modules/resources/ResourceEntry";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { HistoryEntryContextMenu } from "./ContextMenu";
import { MusicHistoryApi } from "./requests";

type Props<T> = {
  value: T;
  setValue: (newData: T | undefined)=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicHistoryEntryElement = React.memo((
  { value, setValue }: Props<MusicHistoryApi.GetManyByCriteria.Data>,
) =>{
  const { user } = useUser();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const { resource: music } = value;
  const { openMenu } = useContextMenuTrigger();
  const { currentResource, playMusic, status, pause, resume } = useBrowserPlayer(
    useShallow(s=> ( {
      currentResource: s.currentResource,
      playMusic: s.playMusic,
      status: s.status,
      pause: s.pause,
      resume: s.resume,
    } )),
  );

  return ResourceEntry( {
    title: music.title,
    subtitle: <MusicSubtitle music={music} />,
    right: <>
      <HistoryTimeView timestamp={value.date.timestamp} />
      <WeightView weight={music.userInfo.weight} />
    </>,
    settings: {
      onClick: (e)=> {
        openMenu( {
          event: e,
          content: <HistoryEntryContextMenu
            value={value}
            setValue={setValue}
            user={user}
          />,
        } );
      },
    },
    favButton: PlaylistFavButton( {
      favoritesPlaylistId,
      musicId: value.resource.id,
      initialValue: value.resource.isFav,
    } ),
    play: {
      status: currentResource?.resourceId === value.resource.id ? status : "stopped",
      onClick: ()=>{
        if (currentResource?.resourceId === value.resource.id) {
          if (status === "paused") {
            resume();

            return;
          } else if (status === "playing") {
            pause();

            return;
          }
        }

        playMusic(value.resource);
      },
    },
    coverUrl: value.resource.coverUrlSmall ?? value.resource.coverUrl,
  } );
} );
