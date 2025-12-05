import { assertIsDefined } from "$shared/utils/validation";
import { useCallback } from "react";
import { useUser } from "#modules/core/auth/useUser";
import { logger } from "#modules/core/logger";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/input/Button";
import { classes } from "#modules/utils/styles";
import { useNewPlaylistButton } from "../../NewPlaylistButton";
import { PlaylistEntity } from "../../Playlist";
import { useMusicPlaylistsForUser } from "../../request-all";
import styles from "./Modal.module.css";

type OpenModalProps = Omit<
  Partial<NonNullable<Parameters<ReturnType<typeof useModal>["openModal"]>[0]>>,
  "staticContent"
> & {
  onSelect: (playlist: PlaylistEntity | null)=> Promise<void>;
};
type Props = {
  closeOnSelect?: boolean;
  nullable?: boolean;
};
export function usePlaylistSelectorModal(props?: Props) {
  const { closeOnSelect = true, nullable = false } = props ?? {};
  const { openModal: _openModal, setModalContent: _, closeModal, id, isOpen } = useModal();
  const { user } = useUser();

  assertIsDefined(user);

  const openModal = useCallback(async (openModalProps: OpenModalProps) => {
    await _openModal( {
      ...openModalProps,
      className: classes(styles.playlistSelectorModal, openModalProps.className),
      title: openModalProps.title ?? "Seleccionar playlist",
      staticContent: (
        <AddToPlaylistModalContent
          userId={user.id}
          nullable={nullable}
          onSelect={async p=>{
            await openModalProps.onSelect(p);

            if (closeOnSelect)
              closeModal();
          }}
        />
      ),
    } );
  }, [user, nullable, closeModal]);

  return {
    id,
    isOpen,
    closeModal,
    openModal,
  };
}

type AddToPlaylistContentProps = {
  userId: string;
  onSelect: (playlist: PlaylistEntity | null)=> void;
  nullable?: boolean;
};
function AddToPlaylistModalContent( { userId, onSelect, nullable }: AddToPlaylistContentProps) {
  const { element, setData, fetchData, isSuccess } = useMusicPlaylistsForUser( {
    userId,
    onSelect,
  } );
  const { element: newPlaylistButton } = useNewPlaylistButton( {
    theme: "white",
    onSuccess: async (newPlaylist) => {
      logger.debug("Nueva playlist creada: " + newPlaylist.name);

      setData((prevData) => {
        if (!prevData)
          return [newPlaylist];

        return [...prevData, newPlaylist];
      } );

      await fetchData();
    },
  } );

  return (
    <>
      {element}

      {isSuccess && <footer style={{
        marginTop: "1rem",
        paddingTop: "1rem",
      }}>
        {nullable && <Button theme="white" onClick={()=> {
          onSelect(null);
        }}>Ninguna</Button>}
        {newPlaylistButton}
      </footer>
      }
    </>
  );
}
