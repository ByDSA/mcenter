import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { usePlayQueryModal } from "./Modal";

type Props = Parameters<ReturnType<typeof usePlayQueryModal>["openModal"]>[0] & {
  label?: string;
};

export const PlayQueryContextMenuItem = (props?: Props) => {
  const playQueryModal = usePlayQueryModal();

  return <ContextMenuItem
    label={props?.label ?? "Reproducir query"}
    onClick={async ()=> {
      await playQueryModal.openModal(props);
    }}
  />;
};
