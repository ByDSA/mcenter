import { SeriesEntity } from "$shared/models/episodes/series";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EditSeriesContextMenuItem } from "../Edit/ContextMenuItem";
import { DeleteSeriesContextMenuItem } from "../Delete/ContextMenuItem";
import { CopySeriesLinkContextMenuItem } from "./CopyLinkContextMenuItem";

type Props = {
  series: SeriesEntity;
  onUpdate: (newData: SeriesEntity)=> void;
  onDelete: ()=> void;
};

export const SeriesSettingsButton = ( { series, onUpdate, onDelete }: Props) => {
  const { openMenu } = useContextMenuTrigger();

  return (
    <SettingsButton
      theme="dark"
      onClick={(e) => {
        openMenu( {
          event: e,
          content: (
            <LocalDataProvider data={series}>
              <CopySeriesLinkContextMenuItem />
              <EditSeriesContextMenuItem onSuccess={onUpdate} />
              <DeleteSeriesContextMenuItem onActionSuccess={onDelete} />
            </LocalDataProvider>
          ),
        } );
      }}
    />
  );
};
