import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { useEditPlaylistModal } from "./Modal";

type Props = Parameters<typeof useEditPlaylistModal>[0] & {
  className?: string;
};

export function EditPlaylistContextMenuItem(
  { className, ...useProps }: Props,
) {
  const { LL } = useI18nContext();
  const { openModal } = useEditPlaylistModal(useProps);

  return <ContextMenuItem
    label={LL.uikit.actions.edit()}
    className={className}
    onClick={() => openModal()} />;
}
