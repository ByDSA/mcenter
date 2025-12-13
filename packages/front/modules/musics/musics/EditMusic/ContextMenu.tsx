import { MusicEntity } from "$shared/models/musics";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { SetState } from "#modules/utils/resources/useCrud";
import { useEditMusicModal } from "./EditModal";

// Se necesita como hook-wrapper, porque si se pone dentro del ContextMenu,
// al cerrarse el menú se destruyen los hooks del modal
// y no se puede actualizar cuando llegan los datos
type Props = {
  initialData: MusicEntity;
  setData?: SetState<MusicEntity>;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditMusicContextMenuItem = (props: Props) => {
  const { openModal } = useEditMusicModal(props);

  return <ContextMenuItem
    label="Editar"
    onClick={()=> {
      return openModal();
    }}
  />;
};
