import { MusicEntity } from "$shared/models/musics";
import { UserPayload } from "$shared/models/auth";
import { MusicLatestViewsContextMenuItem } from "#modules/musics/history/LatestViews/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "#modules/musics/playlists/AddToPlaylistContextMenuItem";
import { EditMusicContextMenuItem } from "../EditMusic/ContextMenu";
import { CopyMusicMenuItem } from "../MusicEntry/ContextMenu";

type Props = {
  music: MusicEntity;
  user: UserPayload | null;
};
export function genContextMenuContent( { music,
  user }: Props) {
  return <>
    {
      user && <AddToPlaylistContextMenuItem
        musicId={music.id}
        user={user}
      />
    }
    {
      user && <EditMusicContextMenuItem
        initialData={music}
      />
    }
    {
      user && <MusicLatestViewsContextMenuItem
        music={music}
        musicId={music.id}
      />
    }
    <CopyMusicMenuItem
      music={music}
    />
  </>;
}
