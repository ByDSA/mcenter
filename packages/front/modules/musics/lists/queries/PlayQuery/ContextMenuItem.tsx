import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicQueryEntity } from "../models";
import { usePlayQueryModal } from "./Modal";

type Props = Parameters<ReturnType<typeof usePlayQueryModal>["openModal"]>[0];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlayQueryModContextMenuItem = (props?: Props) => {
  const playQueryModal = usePlayQueryModal();
  const { data } = useLocalData<MusicQueryEntity>();

  return <ContextMenuItem
    label="Reproducir modificación"
    onClick={async ()=> {
      await playQueryModal.openModal( {
        initialValue: data.query,
        ...props,
      } );
    }}
  />;
};
