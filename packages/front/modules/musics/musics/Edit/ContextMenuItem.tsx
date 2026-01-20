import { MusicEntity } from "$shared/models/musics";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { EditMusicLoader } from "./Loader";
import styles from "./Modal.module.css";

// Se necesita como hook-wrapper, porque si se pone dentro del ContextMenu,
// al cerrarse el menú se destruyen los hooks del modal
// y no se puede actualizar cuando llegan los datos
export const EditMusicContextMenuItem = () => {
  const { openModal } = useModal();
  const { data, setData } = useLocalData<MusicEntity>();

  return <ContextMenuItem
    label="Editar"
    onClick={()=> {
      return openModal( {
        title: "Editar música",
        className: styles.modal,
        content: <LocalDataProvider data={data} setData={setData}>
          <EditMusicLoader />
        </LocalDataProvider>,
      } );
    }}
  />;
};
