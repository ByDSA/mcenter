import { MusicEntity } from "$shared/models/musics";
import { QueuePlayNext, RemoveFromQueue } from "@mui/icons-material";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useMusic } from "#modules/musics/hooks";
import { MusicLatestViewsContextMenuItem } from "#modules/musics/history/LatestViews/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "#modules/musics/lists/playlists/AddToPlaylistContextMenuItem";
import { useUser } from "#modules/core/auth/useUser";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { EditMusicContextMenuItem } from "../Edit/ContextMenuItem";
import { ShareMusicContextMenuItem } from "./ShareContextMenuItem";

type Props = {
  musicId: string;
};

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
        <MusicContextMenu/>
      </LocalDataProvider>,
    } );
  }}/>;
};

type MusicContextMenuProps = {
  onDelete?: ()=> void;
  priorityItemId?: string;
};

export function MusicContextMenu( { onDelete, priorityItemId }: MusicContextMenuProps = {} ) {
  const { data: music } = useLocalData<MusicEntity>();
  const musicId = music.id;
  const { user } = useUser();

  return <>
    <AddToPriorityQueueMenuItem
      musicId={musicId}
    />
    {priorityItemId && (
      <RemoveFromPriorityQueueMenuItem
        priorityItemId={priorityItemId}
      />
    )}

    {
      user && <><AddToPlaylistContextMenuItem
        musicId={musicId}
      />
      <EditMusicContextMenuItem onDelete={onDelete} />
      <MusicLatestViewsContextMenuItem
        music={music}
        musicId={musicId}
      />
      </>
    }
    <ShareMusicContextMenuItem
      token={user?.id}
    />
  </>;
}

type AddToPriorityQueueMenuItemProps = {
  musicId: string;
};

export function AddToPriorityQueueMenuItem( { musicId }: AddToPriorityQueueMenuItemProps) {
  const { LL } = useI18nContext();
  const label = LL.modules.player.queue.priority.add();
  const addToPriorityQueue = useBrowserPlayer(s => s.addToPriorityQueue);

  return (
    <ContextMenuItem
      label={label}
      onClick={() => addToPriorityQueue(musicId)}
      icon={<QueuePlayNext />}
    />
  );
}

type RemoveFromPriorityQueueMenuItemProps = {
  priorityItemId: string;
};

function RemoveFromPriorityQueueMenuItem(
  { priorityItemId }: RemoveFromPriorityQueueMenuItemProps,
) {
  const { LL } = useI18nContext();
  const removeFromPriorityQueue = useBrowserPlayer(s => s.removeFromPriorityQueue);

  return (
    <ContextMenuItem
      onClick={() => removeFromPriorityQueue(priorityItemId)}
      label={LL.modules.player.queue.priority.remove()}
      icon={<RemoveFromQueue/>}
    />
  );
}
