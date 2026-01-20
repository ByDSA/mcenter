import React from "react";
import { useShallow } from "zustand/react/shallow";
import { PATH_ROUTES } from "$shared/routing";
import { useUser } from "#modules/core/auth/useUser";
import { HistoryTimeView, WeightView } from "#modules/history";
import { MusicSubtitle } from "#modules/musics/musics/ListItem/MusicEntry";
import { PlaylistFavButton } from "#modules/musics/lists/playlists/PlaylistFavButton";
import { ResourceEntry } from "#modules/resources/ListItem/ResourceEntry";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
import { useLocalData } from "#modules/utils/local-data-context";
import { useMusic } from "../hooks";
import { MusicHistoryEntrySettingsButton } from "./SettingsButton/SettingsButton";
import { MusicHistoryApi } from "./requests";

export const MusicHistoryListItem = React.memo(() =>{
  const { data } = useLocalData<MusicHistoryApi.GetManyByCriteria.Data>();
  const { user } = useUser();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const { currentResource, playMusic, status, pause, resume } = useBrowserPlayer(
    useShallow(s=> ( {
      currentResource: s.currentResource,
      playMusic: s.playMusic,
      status: s.status,
      pause: s.pause,
      resume: s.resume,
    } )),
  );
  const { data: music } = useMusic(data.resourceId, {
    expand: ["favorite", "fileInfos", "userInfo"],
    debounce: true,
  } );

  if (!music)
    return <ResourceEntryLoading />;

  return <ResourceEntry
    mainTitle={music.title}
    mainTitleHref={PATH_ROUTES.musics.frontend.path + "/" + music.id}
    subtitle={<MusicSubtitle music={music} />}
    right={
      <>
        <HistoryTimeView timestamp={data.date.timestamp} />
        <WeightView weight={music.userInfo!.weight} />
      </>
    }
    settings={<MusicHistoryEntrySettingsButton />}
    favButton={
      <PlaylistFavButton
        favoritesPlaylistId={favoritesPlaylistId}
        musicId={data.resource.id}
      />
    }
    play={{
      status: currentResource?.resourceId === data.resource.id ? status : "stopped",
      onClick: async () => {
        if (currentResource?.resourceId === data.resource.id) {
          if (status === "paused") {
            resume();

            return;
          } else if (status === "playing") {
            pause();

            return;
          }
        }

        await playMusic(data.resourceId);
      },
    }}
    imageCover={data.resource.imageCover}
  />;
} );
