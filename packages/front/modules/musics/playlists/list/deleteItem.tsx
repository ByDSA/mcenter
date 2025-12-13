import { showError } from "$shared/utils/errors/showError";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { MusicPlaylistEntity, musicPlaylistEntitySchema } from "../models";
import { MusicPlaylistsApi } from "../requests";
import styles from "./Delete.module.css";

type Props = Parameters<typeof useDeletePlayList>[0] & {
  value: MusicPlaylistEntity;
  onOpen?: ()=> void;
  className?: string;
};

export function DeletePlaylistContextMenuItem(
  { value, onOpen, getValue, onActionSuccess, onFinish }: Props,
) {
  const { openModal } = useDeletePlayList( {
    getValue,
    onActionSuccess,
    onFinish,
  } );

  return ContextMenuItem( {
    label: "Eliminar",
    theme: "danger",
    className: styles.contextMenuItem,
    onClick: (e)=> {
      e.preventDefault();
      onOpen?.();
      openModal( {
        content: <>
          <p>¿Estás seguro de que deseas eliminar esta playlist?</p>
          <p style={{
            textAlign: "center",
          }}>{value.name}</p>
        </>,
      } ).catch(showError);
    },
  } );
}

type UseDeletePlayListProps = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess: ()=> void;
  getValue: ()=> MusicPlaylistEntity;
};
export function useDeletePlayList(
  { onFinish, onActionSuccess, getValue }: UseDeletePlayListProps,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();

  return {
    ...modal,
    openModal: (props)=> {
      return openModal( {
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
        ...props,
      } );
    },
  };
}
