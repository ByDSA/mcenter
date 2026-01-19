import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useMusic } from "#modules/musics/hooks";
import { CopyMusicLinkContextMenuItem } from "#modules/musics/musics/SettingsButton/CopyMusicLinkContextMenuItem";
import { EditMusicContextMenuItem } from "../../musics/Edit/ContextMenuItem";
import { AddToPlaylistContextMenuItem } from "../../lists/playlists/AddToPlaylistContextMenuItem";
import { MusicLatestViewsContextMenuItem } from "../LatestViews/ContextMenuItem";
import { MusicHistoryApi } from "../requests";
import { DeleteHistoryEntryContextMenuItem } from "../Delete/ContextMenuItem";

// eslint-disable-next-line @typescript-eslint/naming-convention
const HistoryEntryContextMenu = () => {
  const { data } = useLocalData<MusicHistoryApi.GetManyByCriteria.Data>();
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicHistoryEntrySettingsButton = () => {
  const { data, setData } = useLocalData<MusicHistoryApi.GetManyByCriteria.Data>();
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
