import { SeriesEntity } from "$shared/models/episodes/series";
import { assertIsDefined } from "$shared/utils/validation";
import { UserRoleName } from "$shared/models/auth";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { PropsOf } from "#modules/utils/react";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { EditSeriesContextMenuItemCurrentCtx } from "../Edit/ContextMenuItem";
import { DeleteSeriesContextMenuItemCurrentCtx } from "../Delete/ContextMenuItem";
import { UploadEpisodesContextMenuItemCurrentCtx } from "../UploadEpisodes/ContextMenuItem";
import { useSeries } from "../hooks";
import { ShareSeriesContextMenuItemCurrentCtx } from "./ShareContextMenuItem";
import { SyncFileAvailabilityContextMenuItem } from "./SyncFileAvailabilityContextMenuItem";

type Props = PropsOf<typeof UploadEpisodesContextMenuItemCurrentCtx> & {
  onUpdate?: (newData: SeriesEntity)=> void;
  onDelete: ()=> void;
  seriesId: string;
};

export const SeriesSettingsButton = ( { onUpdate, onDelete,
  onUploadEachEpisode: onUpload, seriesId }: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const { data } = useSeries(seriesId);
  const { user } = useUser();
  const isAdmin = !!user?.roles.find(r=>r.name === UserRoleName.ADMIN);

  return (
    <SettingsButton
      theme="dark"
      onClick={(e) => {
        assertIsDefined(data);
        openMenu( {
          event: e,
          content: (
            <LocalDataProvider data={data}>
              {isAdmin && <EditSeriesContextMenuItemCurrentCtx onSuccess={onUpdate} />}
              {isAdmin
                && <UploadEpisodesContextMenuItemCurrentCtx onUploadEachEpisode={onUpload} />}
              {isAdmin && <SyncFileAvailabilityContextMenuItem />}
              <ShareSeriesContextMenuItemCurrentCtx />
              {isAdmin && <DeleteSeriesContextMenuItemCurrentCtx onActionSuccess={onDelete} />}
            </LocalDataProvider>
          ),
        } );
      }}
    />
  );
};
