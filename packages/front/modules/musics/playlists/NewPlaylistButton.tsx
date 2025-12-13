import { Add } from "@mui/icons-material";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/input/Button";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useFormModal } from "#modules/ui-kit/modal/useFormModal";
import { MusicPlaylistsApi } from "./requests";

type ButtonProps = {
  onClick: ()=> void;
  theme: "dark-gray" | "white";
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const NewPlaylistButton = ( { onClick, theme }: ButtonProps) => {
  return <Button
    theme={theme}
    onClick={onClick}
    left={<Add />}>
    Nueva playlist
  </Button>;
};

type FormProps = {
  onSuccess?: (newPlaylist: any)=> void;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const NewPlaylistForm = ( { onSuccess }: FormProps) => {
  const { element: inputName, value: nameValue } = useInputText( {
    nullChecked: false,
    autofocus: true,
    onPressEnter: () => formModal.submit(),
  } );
  const { element: inputVisibility, value: visibilityValue } = useInputText( {
    nullChecked: false,
  } ); // TODO
  const formModal = useFormModal( {
    canSubmit: ()=> nameValue.trim().length > 0,
    onSuccess,
    onSubmit: async () => {
      const api = FetchApi.get(MusicPlaylistsApi);
      const res1 = await api.createOne( {
        name: nameValue.trim(),
        slug: nameValue.trim(),
        visibility: visibilityValue ? "public" : "private",
      } );
      const res = await api.getManyByCriteria( {
        expand: ["ownerUserPublic"],
        filter: {
          id: res1.data!.id,
        },
      } );

      return res.data[0];
    },
  } );

  return (
    <>
      <section>
        <p>Nombre:</p>
        {inputName}
        <p>Visibilidad:</p>
        {inputVisibility}
      </section>
      <footer>
        <Button
          theme="white"
          onClick={formModal.submit}
          disabled={!formModal.canSubmit}
        >
          Crear
        </Button>
      </footer>
    </>
  );
};

type Props = {
  onSuccess?: (newPlaylist: any)=> void;
  theme: "dark-gray" | "white";
};

export function useNewPlaylistButton(props: Props) {
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: "Nueva playlist",
      content: <NewPlaylistForm onSuccess={v=> {
        props.onSuccess?.(v);
        usingModal.closeModal();
      }} />,
    } );
  };

  return {
    element: (
      <NewPlaylistButton theme={props.theme} onClick={openModal} />
    ),
  };
}
