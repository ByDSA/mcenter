import { SeriesEntity } from "$shared/models/episodes/series";
import { assertIsDefined } from "$shared/utils/validation";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { PropsOf } from "#modules/utils/react";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EditSeriesContextMenuItemCurrentCtx } from "../Edit/ContextMenuItem";
import { DeleteSeriesContextMenuItemCurrentCtx } from "../Delete/ContextMenuItem";
import { UploadEpisodesContextMenuItemCurrentCtx } from "../UploadEpisodes/ContextMenuItem";
import { useSeries } from "../hooks";
import { CopySeriesLinkContextMenuItemCurrentCtx } from "./CopyLinkContextMenuItem";

type Props = PropsOf<typeof UploadEpisodesContextMenuItemCurrentCtx> & {
  onUpdate?: (newData: SeriesEntity)=> void;
  onDelete: ()=> void;
  seriesId: string;
};

export const SeriesSettingsButton = ( { onUpdate, onDelete,
  onUploadEachEpisode: onUpload, seriesId }: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const { data } = useSeries(seriesId);

  return (
    <SettingsButton
      theme="dark"
      onClick={(e) => {
        assertIsDefined(data);
        openMenu( {
          event: e,
          content: (
            <LocalDataProvider data={data}>
              <CopySeriesLinkContextMenuItemCurrentCtx />
              <EditSeriesContextMenuItemCurrentCtx onSuccess={onUpdate} />
              <UploadEpisodesContextMenuItemCurrentCtx onUploadEachEpisode={onUpload} />
              <DeleteSeriesContextMenuItemCurrentCtx onActionSuccess={onDelete} />
            </LocalDataProvider>
          ),
        } );
      }}
    />
  );
};
