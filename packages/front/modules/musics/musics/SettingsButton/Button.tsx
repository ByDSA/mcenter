import { MusicEntity } from "$shared/models/musics";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useMusic } from "#modules/musics/hooks";
import { MusicLatestViewsContextMenuItem } from "#modules/musics/history/LatestViews/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "#modules/musics/lists/playlists/AddToPlaylistContextMenuItem";
import { useUser } from "#modules/core/auth/useUser";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EditMusicContextMenuItem } from "../Edit/ContextMenuItem";
import { CopyMusicLinkContextMenuItem } from "./CopyMusicLinkContextMenuItem";

type Props = {
  musicId: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicSettingsButton = ( { musicId }: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const { data } = useMusic(musicId);

  return <SettingsButton onClick={(e)=> {
    if (!data)
      return;

    openMenu( {
      event: e,
      content: <LocalDataProvider
        data={data}>
        <MusicContextMenu
          music={data}
        /></LocalDataProvider>,
    } );
  }}/>;
};

type Props2 = {
  music: MusicEntity;
};
export function MusicContextMenu( { music }: Props2) {
  const musicId = music.id;
  const { user } = useUser();

  return <>
    {
      user && <><AddToPlaylistContextMenuItem
        musicId={musicId}
      />
      <EditMusicContextMenuItem />
      <MusicLatestViewsContextMenuItem
        music={music}
        musicId={musicId}
      />
      </>
    }
    <CopyMusicLinkContextMenuItem
      token={user?.id}
    />
  </>;
}
