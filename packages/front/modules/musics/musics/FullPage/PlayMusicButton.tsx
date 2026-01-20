import { MusicEntity } from "$shared/models/musics";
import { useShallow } from "zustand/react/shallow";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { ResourcePlayButtonView } from "#modules/resources/PlayButton/PlayButton";

type Props = {
  music: MusicEntity;
  disabled?: boolean;
};
export const PlayMusicButton = ( { music, disabled }: Props) => {
  const player = useBrowserPlayer(useShallow((s) => ( {
    currentResource: s.currentResource,
    status: s.status,
    playMusic: s.playMusic,
    resume: s.resume,
    pause: s.pause,
  } )));
  const isPlayingSameMusic = player.currentResource?.type === "music"
    && player.currentResource?.resourceId === music.id;
  const status: PlayerStatus = isPlayingSameMusic ? player.status : "stopped";
  const onClick = async () => {
    if (status === "stopped")
      await player.playMusic(music.id);
    else if (status === "paused")
      player.resume();
    else
      player.pause();
  };

  return <ResourcePlayButtonView
    disabled={disabled}
    status={status}
    onClick={disabled ? undefined : onClick}
  />;
};
