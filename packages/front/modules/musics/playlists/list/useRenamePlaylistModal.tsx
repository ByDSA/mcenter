import type { PlaylistEntity } from "../Playlist";
import { assertIsDefined } from "$shared/utils/validation";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { useModal } from "#modules/ui-kit/modal/useModal";
import { Button } from "#modules/ui-kit/input/Button";
import { MusicPlaylistsApi } from "../requests";
import { MusicPlaylistEntity } from "../models";
import styles from "./RenameModal.module.css";

type UseRenameModalProps = {
  onClose?: ()=> Promise<void> | void;
  onSuccess?: (props: {previous: MusicPlaylistEntity;
current: MusicPlaylistEntity;} )=> Promise<void> |
    void;
};
export function useRenamePlaylistModal( { onClose, onSuccess }: UseRenameModalProps) {
  const [playlist, setPlaylist] = useState<PlaylistEntity | null>(null);
  const setValueRef = useRef<(value: PlaylistEntity)=> void>(null);
  const [body, setBody] = useState<{
    name?: string;
    slug?: string;
  }>( {} );
  const canSend = useMemo(() => {
    if (!playlist)
      return false;

    if (body.name && body.name !== playlist.name)
      return true;

    if (body.slug && body.slug !== playlist.slug)
      return true;

    return false;
  }, [body, playlist]);
  const send = useCallback(async () => {
    if (!canSend)
      return;

    assertIsDefined(playlist);

    const api = FetchApi.get(MusicPlaylistsApi);
    const res = await api.patchOne(playlist.id, body);
    const newPlaylist = res.data as PlaylistEntity | null;

    if (newPlaylist)
      setValueRef.current?.(newPlaylist);

    await renameModal.close();

    if (newPlaylist) {
      await onSuccess?.( {
        current: newPlaylist,
        previous: playlist,
      } );
    }
  }, [playlist, body, canSend]);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { Modal, ...renameModal } = useModal( {
    title: "Renombrar",
    onClose,
    className: styles.renameModal,
  } );
  const { element: inputNameElement, setValue: setName, ref, value: nameValue } = useInputText( {
    defaultValue: "",
    nullChecked: false,
    onPressEnter: send,
  } );
  const { element: inputSlugElement, setValue: setSlug, value: slugValue } = useInputText( {
    nullChecked: false,
    defaultValue: "",
    onPressEnter: send,
  } );

  useEffect(()=> {
    if (nameValue && playlist?.name !== nameValue) {
      setBody((b) => ( {
        ...b,
        name: nameValue,
      } ));
    } else {
      setBody((b) => {
        const newBody = {
          ...b,
        };

        delete newBody.name;

        return newBody;
      } );
    }

    if (slugValue && playlist?.slug !== slugValue) {
      setBody((b) => ( {
        ...b,
        slug: slugValue,
      } ));
    } else {
      setBody((b) => {
        const newBody = {
          ...b,
        };

        delete newBody.slug;

        return newBody;
      } );
    }
  }, [nameValue, slugValue]);
  const element = <Modal>
    <section>
      <p>Nombre:</p>
      {inputNameElement}
    </section>
    <section>
      <p>Url slug:</p>
      {inputSlugElement}
    </section>
    <footer>
      <Button onClick={send}
        disabled={!canSend}
      >Renombrar</Button>
    </footer>
  </Modal>;

  type OpenProps = {value: PlaylistEntity;
setValue: (value: PlaylistEntity)=> void;};

  return {
    element,
    ...renameModal,
    open: ( { setValue, value: pl }: OpenProps) => {
      setPlaylist(pl);
      setName(pl.name);
      setSlug(pl.slug);
      renameModal.open();
      setValueRef.current = setValue;
      setTimeout(() => {
        if (!ref.current)
          return;

        ref.current.focus();
        const { length } = ref.current.value;

        ref.current.setSelectionRange(length, length);
      }, 0);
    },
  };
}
