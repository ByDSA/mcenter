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
  const formModal = useFormModal( {
    canSubmit: ()=> nameValue.trim().length > 0,
    onSuccess,
    onSubmit: async () => {
      const api = FetchApi.get(MusicPlaylistsApi);

      return (await api.createOne( {
        name: nameValue.trim(),
        slug: nameValue.trim(),
      } )).data;
    },
  } );

  return (
    <>
      <section>
        <p>Nombre:</p>
        {inputName}
      </section>
      <footer>
        <Button
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
  const modal = useModal();
  const openModal = () => {
    return modal.openModal( {
      title: "Nueva playlist",
      staticContent: <NewPlaylistForm onSuccess={props.onSuccess} />,
    } );
  };

  return {
    element: (
      <NewPlaylistButton theme={props.theme} onClick={openModal} />
    ),
  };
}
