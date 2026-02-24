import { PATH_ROUTES } from "$shared/routing";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { InstallContextMenuItem } from "app/manifest/install/InstallButton";
import { isMobile } from "#modules/utils/env";
import { useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { EditPlaylistContextMenuItem } from "../Edit/ContextMenuItem";
import { MusicPlaylistEntity } from "../models";
import { DeletePlaylistContextMenuItem } from "../Delete/ContextMenuItem";
import { SharePlaylistLinkContextMenuItem } from "./SharePlaylistLinkContextMenuItem";

type Props = {
  onEdit?: (current: MusicPlaylistEntity, previous: MusicPlaylistEntity)=> void;
  onDelete?: ()=> void;
};
export const MusicPlaylistSettingsButton = (props: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const { user } = useUser();
  const { data, setData } = useLocalData<MusicPlaylistEntity>();
  const isUserOwner = data.ownerUserId === user?.id;

  return <SettingsButton theme="dark" onClick={ (e: React.MouseEvent<HTMLElement>) => {
    openMenu( {
      event: e,
      content: (
        <LocalDataProvider data={data!} setData={setData}>
          {isUserOwner && <EditPlaylistContextMenuItem
            onSuccess={( { previous, current } ) => {
              props.onEdit?.(current, previous);
            }}
          />}
          <SharePlaylistLinkContextMenuItem />
          {isMobile() && <InstallContextMenuItem
            name={data.name}
            path={`${PATH_ROUTES.musics.frontend.playlists.withParams( {
              playlistId: data.id,
            } )}?autoplay=1`}
          />}
          {isUserOwner
            && <DeletePlaylistContextMenuItem
              onActionSuccess={()=> {
                // Si esta es la playlist que estaba sonando, cerrar el player
                const player = useBrowserPlayer.getState();

                if (player.currentResource?.playlistId === data.id)
                  player.close();

                props.onDelete?.();
              }}
            />
          }
        </LocalDataProvider>
      ),
    } );
  }} />;
};
