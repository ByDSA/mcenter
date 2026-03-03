import HistoryIcon from "@mui/icons-material/History";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import { EmptyList, EmptyListTopIconWrap } from "../resources/EmptyList/EmptyList";

export const EmptyHistory = () => {
  const { LL } = useI18nContext();

  return <EmptyList
    top={<EmptyListTopIconWrap><HistoryIcon/></EmptyListTopIconWrap>}
    label={LL.modules.resources.history.neverPlayed()}
  />;
};
