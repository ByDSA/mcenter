import type { MusicPlaylistEntity } from "../models";
import { useEffect, useMemo, useState } from "react";
import { Button } from "#modules/ui-kit/input/Button";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { ImageCoverSelectorButton } from "#modules/image-covers/Selector/Button";
import { MusicPlaylistsApi } from "../requests";
import styles from "./EditModal.module.css";

type Props = {
  initialValue: MusicPlaylistEntity;
  onSuccess?: (data: { previous: MusicPlaylistEntity;
current: MusicPlaylistEntity; } )=> void;
  updateLocalValue: (value: MusicPlaylistEntity)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditPlaylistForm = ( { initialValue,
  onSuccess,
  updateLocalValue }: Props) => {
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
  const [currentImageCover, setCurrentImageCover] = useState(initialValue.imageCover ?? null);
  const body = useMemo(() => {
    const changes: { name?: string;
slug?: string;
imageCoverId?: string | null; } = {};

    if (nameValue.trim() !== initialValue.name)
      changes.name = nameValue.trim();

    if (slugValue.trim() !== initialValue.slug)
      changes.slug = slugValue.trim();

    if (currentImageCover?.id !== initialValue.imageCoverId)
      changes.imageCoverId = currentImageCover?.id ?? null;

    return changes;
  }, [nameValue, slugValue, initialValue, currentImageCover]);
  const form = useFormInModal( {
    canSubmit: () => Object.keys(body).length > 0
    && nameValue.trim().length > 0
    && slugValue.trim().length > 0,
    onSuccess: (newData) => {
      updateLocalValue(newData);

      onSuccess?.( {
        previous: initialValue,
        current: newData,
      } );
    },
    onSubmit: async () => {
      const api = FetchApi.get(MusicPlaylistsApi);

      await api.patchOne(initialValue.id, body);

      // Para que devuelva el imageCover:
      const res = await api.getOneByCriteria( {
        filter: {
          id: initialValue.id,
        },
        expand: ["imageCover", "ownerUserPublic"],
      } );

      return res.data as MusicPlaylistEntity;
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
      <section>
        <p>Imagen:</p>
        <ImageCoverSelectorButton
          onSelect={(imageCover) => {
            setCurrentImageCover(imageCover);
          }}
          current={currentImageCover}
        />
      </section>
      <footer>
        <Button
          theme="white"
          onClick={form.submit}
          disabled={!form.canSubmit}
        >
          Editar
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

export function useEditPlaylistModal(props: HookProps = {} ) {
  const { openModal: _openModal, ...usingModal } = useModal();
  const openModal = ( { value, setValue, onClose }: OpenModalArgs) => {
    return _openModal( {
      title: "Editar",
      className: styles.modal,
      onClose: onClose,
      content: (
        <EditPlaylistForm
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
