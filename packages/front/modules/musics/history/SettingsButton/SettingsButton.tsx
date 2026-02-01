import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useMusic } from "#modules/musics/hooks";
import { CopyMusicLinkContextMenuItem } from "#modules/musics/musics/SettingsButton/CopyMusicLinkContextMenuItem";
import { EditMusicContextMenuItem } from "../../musics/Edit/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "../../lists/playlists/AddToPlaylistContextMenuItem";
import { MusicLatestViewsContextMenuItem } from "../LatestViews/ContextMenuItem";
import { DeleteHistoryEntryContextMenuItem } from "../Delete/ContextMenuItem";
import { MusicHistoryEntryEntity } from "../models";

const HistoryEntryContextMenu = () => {
  const { data } = useLocalData<MusicHistoryEntryEntity>();
  const { user } = useUser();
  const { data: music } = useMusic(data.resourceId);

  return (
    <>
      <LocalDataProvider data={music}>
        <AddToPlaylistContextMenuItem
          musicId={data.resourceId}
        />
        <CopyMusicLinkContextMenuItem
          token={user?.id}
        />
        <EditMusicContextMenuItem />
      </LocalDataProvider>
      <MusicLatestViewsContextMenuItem
        music={data.resource}
        musicId={data.resourceId}
        maxTimestamp={data.date.timestamp}
      />
      <DeleteHistoryEntryContextMenuItem />
    </>
  );
};

export const MusicHistoryEntrySettingsButton = () => {
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
              <HistoryEntryContextMenu />
            </LocalDataProvider>,
      } );
    }}/>;
};
