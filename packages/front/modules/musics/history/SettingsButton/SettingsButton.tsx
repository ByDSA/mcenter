import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useMusic } from "#modules/musics/hooks";
import { ShareMusicContextMenuItem } from "#modules/musics/musics/SettingsButton/ShareContextMenuItem";
import { AddToPriorityQueueMenuItem } from "#modules/musics/musics/SettingsButton/Button";
import { EditMusicContextMenuItem } from "../../musics/Edit/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "../../lists/playlists/AddToPlaylistContextMenuItem";
import { MusicLatestViewsContextMenuItem } from "../LatestViews/ContextMenuItem";
import { DeleteHistoryEntryContextMenuItem } from "../Delete/ContextMenuItem";
import { MusicHistoryEntryEntity } from "../models";

type ContextMenuProps = {
  onDeleteMusic: ()=> void;
};

const HistoryEntryContextMenu = ( { onDeleteMusic }: ContextMenuProps) => {
  const { data } = useLocalData<MusicHistoryEntryEntity>();
  const { user } = useUser();
  const { data: music } = useMusic(data.resourceId);

  return (
    <>
      <AddToPriorityQueueMenuItem
        musicId={data.resourceId}
      />
      <LocalDataProvider data={music}>
        <AddToPlaylistContextMenuItem
          musicId={data.resourceId}
        />
        <EditMusicContextMenuItem
          onDelete={onDeleteMusic}
        />
        <MusicLatestViewsContextMenuItem
          music={data.resource}
          musicId={data.resourceId}
          maxTimestamp={data.date.timestamp}
        />
        <ShareMusicContextMenuItem
          token={user?.id}
        />
      </LocalDataProvider>
      <DeleteHistoryEntryContextMenuItem />
    </>
  );
};

type SettingsButtonProps = {
  onDeleteMusic: ()=> void;
};

export const MusicHistoryEntrySettingsButton = ( { onDeleteMusic }: SettingsButtonProps) => {
  const { data, setData } = useLocalData<MusicHistoryEntryEntity>();
  const { openMenu } = useContextMenuTrigger();

  return <SettingsButton
    theme="dark"
    onClick={(e) => {
      openMenu( {
        event: e,
        content:
            <LocalDataProvider
              data={data}
              setData={setData} >
              <HistoryEntryContextMenu onDeleteMusic={onDeleteMusic} />
            </LocalDataProvider>,
      } );
    }}/>;
};
