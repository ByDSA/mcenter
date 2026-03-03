import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { useEditSmartPlaylistModal } from "./Modal";

type Props = Parameters<typeof useEditSmartPlaylistModal>[0] & {
  className?: string;
};

export function EditSmartPlaylistContextMenuItem( { className, ...useProps }: Props) {
  const { LL } = useI18nContext();
  const { openModal } = useEditSmartPlaylistModal(useProps);

  return <ContextMenuItem
    label={LL.uikit.actions.edit()}
    className={className}
    onClick={()=>openModal()} />;
}
