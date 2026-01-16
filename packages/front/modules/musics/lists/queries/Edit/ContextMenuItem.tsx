import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useEditQueryModal } from "./Modal";

type Props = Parameters<typeof useEditQueryModal>[0] & {
  className?: string;
};

export function EditQueryContextMenuItem( { className, ...useProps }: Props) {
  const { openModal } = useEditQueryModal(useProps);

  return <ContextMenuItem
    label="Editar"
    className={className}
    onClick={()=>openModal()} />;
}
