import { MusicEntity } from "$shared/models/musics";
import { UserPayload } from "$shared/models/auth";
import { MusicLatestViewsContextMenuItem } from "#modules/musics/history/LatestViews/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "#modules/musics/lists/playlists/AddToPlaylistContextMenuItem";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { EditMusicContextMenuItem } from "../EditMusic/ContextMenu";
import { copyMusicUrl } from "./copy-music-url";

type Props = {
  music: MusicEntity;
  user: UserPayload | null;
};
export function genMusicEntryContextMenuContent( { music,
  user }: Props) {
  const musicId = music.id;

  return <>
    {
      user && <AddToPlaylistContextMenuItem
        musicId={musicId}
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
        musicId={musicId}
      />
    }
    <CopyMusicMenuItem
      music={music}
      token={user?.id}
    />
  </>;
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
