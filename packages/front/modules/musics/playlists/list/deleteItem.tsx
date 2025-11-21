import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { MusicPlaylistEntity, musicPlaylistEntitySchema } from "../models";
import { MusicPlaylistsApi } from "../requests";
import styles from "./Delete.module.css";

type Props = {
  value: MusicPlaylistEntity;
  confirmModal: ReturnType<typeof useConfirmModal>;
  className?: string;
};

export function DeletePlaylistContextMenuItem( { value, confirmModal }: Props) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Modal } = confirmModal;
  const confirmModalElement = <Modal>
    <p>¿Estás seguro de que deseas eliminar esta playlist?</p>
    <p style={{
      textAlign: "center",
    }}>{value.name}</p>
  </Modal>;

  return (
    <>
      <p className={styles.contextMenuItem} onClick={(e)=> {
        e.preventDefault();
        confirmModal.open();
      }}>Eliminar</p>
      {confirmModalElement}
    </>
  );
}

type UseDeletePlayListProps = Pick<Parameters<typeof useConfirmModal>[0], "onFinish"> & {
  onActionSuccess: ()=> void;
  getValue: ()=> MusicPlaylistEntity;
};
export function useDeletePlayList(
  { onFinish, onActionSuccess, getValue }: UseDeletePlayListProps,
) {
  return useConfirmModal( {
    title: "Confirmar eliminación",
    onFinish,
    onActionSuccess,
    bypass: ()=> {
      const value = getValue();

      return value.list.length === 0;
    },
    action: async ()=> {
      const value = getValue();

      musicPlaylistEntitySchema.parse(value);
      const api = FetchApi.get(MusicPlaylistsApi);
      const response = await api.deleteOneById(value.id);
      const deleted = response.data;

      if (deleted) {
        logger.debug("Deleted playlist: " + deleted.name);

        return true;
      }

      return false;
    },
  } );
}

export function useDeletePlaylistContextMenuItem(props: Parameters<typeof useDeletePlayList>[0]) {
  const using = useDeletePlayList(props);

  return {
    generateDeletePlayListContextMenuItem: (value: MusicPlaylistEntity)=> {
      return DeletePlaylistContextMenuItem( {
        value,
        confirmModal: using,
      } );
    },
  };
}
