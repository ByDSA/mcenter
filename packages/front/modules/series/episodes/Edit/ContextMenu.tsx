import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { SetState } from "#modules/utils/react";
import { EpisodeHistoryApi } from "../history/requests";
import { useEditEpisodeModal } from "./EditModal";

type Data = EpisodeHistoryApi.GetMany.Data["resource"];

// Se necesita como hook-wrapper, porque si se pone dentro del ContextMenu,
// al cerrarse el menú se destruyen los hooks del modal
// y no se puede actualizar cuando llegan los datos
type Props = {
  initialData: Data;
  setData: SetState<Data>;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditEpisodeContextMenuItem = (props: Props) => {
  const { openModal } = useEditEpisodeModal(props);

  return <ContextMenuItem
    label="Editar"
    onClick={openModal}
  />;
};
