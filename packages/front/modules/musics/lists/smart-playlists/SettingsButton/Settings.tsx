import { PATH_ROUTES } from "$shared/routing";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { InstallContextMenuItem } from "app/manifest/install/InstallButton";
import { isMobile } from "#modules/utils/env";
import { DeleteSmartPlaylistContextMenuItem } from "../Delete/ContextMenuItem";
import { EditSmartPlaylistContextMenuItem } from "../Edit/ContextMenuItem";
import { PlaySmartPlaylistContextMenuItem } from "../Play/ContextMenuItem";
import { MusicSmartPlaylistEntity } from "../models";
import { CopySmartPlaylistLinkContextMenuItem } from "./CopySmartPlaylistLinkContextMenuItem";

type Props = {
  onDelete: ()=> void;
};
export const MusicSmartPlaylistSettingsButton = (props: Props) => {
  const { data, setData } = useLocalData<MusicSmartPlaylistEntity>();
  const { openMenu } = useContextMenuTrigger();
  const { user } = useUser();
  const isUserOwner = data.ownerUserId === user?.id;

  return <SettingsButton theme="dark" onClick={(e)=> {
    openMenu( {
      event: e,
      content: <LocalDataProvider data={data!} setData={setData}>
        <PlaySmartPlaylistContextMenuItem
          initialValue={data.query}
          label="Reproducir modificación"
        />
        <CopySmartPlaylistLinkContextMenuItem />
        {isMobile() && <InstallContextMenuItem
          name={data.name}
          path={`${PATH_ROUTES.musics.frontend.smartPlaylists.withParams(data.id)}?autoplay=1`}
        />}
        {isUserOwner && <>
          <EditSmartPlaylistContextMenuItem />
          <DeleteSmartPlaylistContextMenuItem
            onActionSuccess={props.onDelete}
          />
        </>}
      </LocalDataProvider>,
    } );
  }} />;
};
