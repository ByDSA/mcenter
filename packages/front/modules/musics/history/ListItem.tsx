import React from "react";
import { useShallow } from "zustand/react/shallow";
import { PATH_ROUTES } from "$shared/routing";
import { showError } from "$shared/utils/errors/showError";
import { assertIsDefined } from "$shared/utils/validation";
import { getFirstAvailableFileInfoOrFirst } from "$shared/models/file-info-common/file-info";
import { useUser } from "#modules/core/auth/useUser";
import { HistoryTimeView, WeightView } from "#modules/history";
import { MusicSubtitle } from "#modules/musics/musics/ListItem/MusicEntry";
import { PlaylistFavButton } from "#modules/musics/lists/playlists/PlaylistFavButton";
import { ResourceEntry } from "#modules/resources/ListItem/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
import { useLocalData } from "#modules/utils/local-data-context";
import { useMusic } from "../hooks";
import { isMusicAvailable } from "../models";
import { MusicHistoryEntrySettingsButton } from "./SettingsButton/SettingsButton";
import { MusicHistoryEntryEntity } from "./models";

export const MusicHistoryListItem = React.memo(() =>{
  const { data } = useLocalData<MusicHistoryEntryEntity>();
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
    debounce: true,
  } );

  // TODO: se necesita por la duración
  if (!music?.fileInfos)
    useMusic.invalidateCache(data.resourceId).catch(showError);

  if (!music)
    return <ResourceEntryLoading />;

  assertIsDefined(data.resource);

  const fileInfo = getFirstAvailableFileInfoOrFirst(music.fileInfos);
  const isDisabled = !isMusicAvailable(music, {
    precalcFileInfo: fileInfo,
  } );
  let playStatus: PlayerStatus | "disabled";

  if (isDisabled)
    playStatus = "disabled";
  else
    playStatus = currentResource?.resourceId === data.resourceId ? status : "stopped";

  return <ResourceEntry
    disabled={music.disabled}
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
        musicId={data.resourceId}
      />
    }
    play={{
      status: playStatus,
      onClick: async () => {
        if (currentResource?.resourceId === data.resourceId) {
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
