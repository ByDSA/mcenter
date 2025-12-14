import React from "react";
import { useUser } from "#modules/core/auth/useUser";
import { HistoryTimeView, WeightView } from "#modules/history";
import { MusicSubtitle } from "#modules/musics/musics/MusicEntry/MusicEntry";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { ResourceEntry } from "#modules/resources/ResourceEntry";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
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
      isPlaying: false,
      // eslint-disable-next-line no-empty-function
      onClick: ()=>{},
    },
  } );
} );
