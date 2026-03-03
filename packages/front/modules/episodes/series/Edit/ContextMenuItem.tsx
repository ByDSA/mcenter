import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { useEditSeriesModal } from "./Modal";

type Props = Parameters<typeof useEditSeriesModal>[0];

export function EditSeriesContextMenuItemCurrentCtx(props: Props) {
  const { LL } = useI18nContext();
  const { openModal } = useEditSeriesModal(props);

  return <ContextMenuItem label={LL.uikit.actions.edit()} onClick={() => openModal()} />;
}
