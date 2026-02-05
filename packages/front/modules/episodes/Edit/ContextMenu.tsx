import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { EpisodeEntity } from "../models";
import { useEditEpisodeModal } from "./EditModal";

// Se necesita como hook-wrapper, porque si se pone dentro del ContextMenu,
// al cerrarse el menú se destruyen los hooks del modal
// y no se puede actualizar cuando llegan los datos
type Props = {
  initialData: EpisodeEntity;
};
export const EditEpisodeContextMenuItem = (props: Props) => {
  const { openModal } = useEditEpisodeModal(props);

  return <ContextMenuItem
    label="Editar"
    onClick={openModal}
  />;
};
