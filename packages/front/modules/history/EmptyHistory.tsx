import HistoryIcon from "@mui/icons-material/History";
import { EmptyList, EmptyListTopIconWrap } from "./EmptyList/EmptyList";

export const EmptyHistory = () => {
  return <EmptyList
    top={<EmptyListTopIconWrap><HistoryIcon/></EmptyListTopIconWrap>}
    label="No hay ninguna reproducción."
  />;
};
