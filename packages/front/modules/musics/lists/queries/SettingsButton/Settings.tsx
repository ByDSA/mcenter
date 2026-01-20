import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import { DeleteQueryContextMenuItem } from "../Delete/ContextMenuItem";
import { EditQueryContextMenuItem } from "../Edit/ContextMenuItem";
import { PlayQueryModContextMenuItem } from "../PlayQuery/ContextMenuItem";
import { MusicQueryEntity } from "../models";
import { CopyQueryLinkContextMenuItem } from "./CopyQueryLinkContextMenuItem";

type Props = {
  onDelete: ()=> void;
};
export const MusicQuerySettingsButton = (props: Props) => {
  const { data, setData } = useLocalData<MusicQueryEntity>();
  const { openMenu } = useContextMenuTrigger();
  const { user } = useUser();
  const isUserOwner = data.ownerUserId === user?.id;

  return <SettingsButton theme="dark" onClick={(e)=> {
    openMenu( {
      event: e,
      content: <LocalDataProvider data={data!} setData={setData}>
        <PlayQueryModContextMenuItem />
        <CopyQueryLinkContextMenuItem />
        {isUserOwner && <>
          <EditQueryContextMenuItem />
          <DeleteQueryContextMenuItem
            onActionSuccess={props.onDelete}
          />
        </>}
      </LocalDataProvider>,
    } );
  }} />;
};
