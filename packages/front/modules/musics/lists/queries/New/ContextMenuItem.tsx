import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { NewQueryModalProps, useNewQueryModal } from "./Modal";

export const NewQueryContextMenuItem = ( { onSuccess }: NewQueryModalProps) => {
  const { openModal } = useNewQueryModal( {
    onSuccess,
  } );

  return (
    <ContextMenuItem
      onClick={()=>openModal()}
      label="Nueva query"
    />
  );
};
