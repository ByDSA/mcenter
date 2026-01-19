import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { EditPlaylistContextMenuItem } from "../Edit/ContextMenuItem";
import { MusicPlaylistEntity } from "../models";
import { DeletePlaylistContextMenuItem } from "../Delete/ContextMenuItem";
import { CopyPlaylistLinkContextMenuItem } from "./CopyPlaylistLinkContextMenuItem";

type Props = {
  onEdit?: (current: MusicPlaylistEntity, previous: MusicPlaylistEntity)=> void;
  onDelete?: ()=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
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
          <CopyPlaylistLinkContextMenuItem />
          {isUserOwner && <>
            <EditPlaylistContextMenuItem
              onSuccess={( { previous, current } ) => {
                props.onEdit?.(current, previous);
              }}
            />
            <DeletePlaylistContextMenuItem
              onActionSuccess={()=> {
                props.onDelete?.();
              }}
            />
          </>
          }
        </LocalDataProvider>
      ),
    } );
  }} />;
};
