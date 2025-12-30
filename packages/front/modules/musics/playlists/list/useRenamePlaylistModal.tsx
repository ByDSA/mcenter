import type { PlaylistEntity } from "../Playlist/types";
import type { MusicPlaylistEntity } from "../models";
import { useEffect, useMemo } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { MusicPlaylistsApi } from "../requests";
import styles from "./RenameModal.module.css";

type RenameFormProps = {
  initialValue: MusicPlaylistEntity;
  onSuccess?: (data: { previous: MusicPlaylistEntity;
current: MusicPlaylistEntity; } )=> void;
  updateLocalValue: (value: PlaylistEntity)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RenamePlaylistForm = ( { initialValue,
  onSuccess,
  updateLocalValue }: RenameFormProps) => {
  const { element: inputName, value: nameValue, ref: nameRef } = useInputText( {
    defaultValue: initialValue.name,
    nullChecked: false,
    onPressEnter: () => form.submit(),
  } );
  const { element: inputSlug, value: slugValue } = useInputText( {
    defaultValue: initialValue.slug,
    nullChecked: false,
    onPressEnter: () => form.submit(),
  } );
  const body = useMemo(() => {
    const changes: { name?: string;
slug?: string; } = {};

    if (nameValue.trim() !== initialValue.name)
      changes.name = nameValue.trim();

    if (slugValue.trim() !== initialValue.slug)
      changes.slug = slugValue.trim();

    return changes;
  }, [nameValue, slugValue, initialValue]);
  const form = useFormInModal( {
    canSubmit: () => Object.keys(body).length > 0 && nameValue.trim().length > 0,
    onSuccess: (newData) => {
      updateLocalValue(newData);
      onSuccess?.( {
        previous: initialValue,
        current: newData,
      } );
    },
    onSubmit: async () => {
      const api = FetchApi.get(MusicPlaylistsApi);
      const res = await api.patchOne(initialValue.id, body);

      return res.data as PlaylistEntity;
    },
  } );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameRef.current) {
        nameRef.current.focus();
        const len = nameRef.current.value.length;

        nameRef.current.setSelectionRange(len, len);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [nameRef]);

  return (
    <>
      <section>
        <p>Nombre:</p>
        {inputName}
      </section>
      <section>
        <p>Url slug:</p>
        {inputSlug}
      </section>
      <footer>
        <Button
          theme="white"
          onClick={form.submit}
          disabled={!form.canSubmit}
        >
          Renombrar
        </Button>
      </footer>
    </>
  );
};

type HookProps = {
  onSuccess?: (props: { previous: MusicPlaylistEntity;
current: MusicPlaylistEntity; } )=> Promise<void> | void;
};

type OpenModalArgs = {
  value: MusicPlaylistEntity;
  setValue: (value: MusicPlaylistEntity)=> void;
  onClose?: ()=> Promise<void> | void;
};

export function useRenamePlaylistModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const openModal = ( { value, setValue, onClose }: OpenModalArgs) => {
    return _openModal( {
      title: "Renombrar",
      className: styles.renameModal,
      onClose: onClose,
      content: (
        <RenamePlaylistForm
          initialValue={value}
          updateLocalValue={setValue}
          onSuccess={async (v)=>{
            await props.onSuccess?.(v);
            usingModal.closeModal();
          }}
        />
      ),
    } );
  };

  return {
    ...usingModal,
    openModal,
  };
}
