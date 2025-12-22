import { MusicEntity } from "$shared/models/musics";
import { UserPayload } from "$shared/models/auth";
import { MusicLatestViewsContextMenuItem } from "#modules/musics/history/LatestViews/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "#modules/musics/playlists/AddToPlaylistContextMenuItem";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { SetState } from "#modules/utils/resources/useCrud";
import { EditMusicContextMenuItem } from "../EditMusic/ContextMenu";
import { copyMusicUrl } from "./MusicEntry";

type Props = {
  music: MusicEntity;
  setMusic?: SetState<MusicEntity>;
  user: UserPayload | null;
};
export function genMusicEntryContextMenuContent( { music,
  user,
  setMusic }: Props) {
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
        setData={setMusic}
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
