import { Add } from "@mui/icons-material";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/input/Button";
import { useInputText } from "#modules/ui-kit/input/UseInputText";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useFormInModal } from "#modules/ui-kit/modal/useFormModal";
import { MusicPlaylistsApi } from "./requests";
import styles from "./NewPlaylistButton.module.css";

type ButtonProps = {
  onSuccess?: (newPlaylist: any)=> void;
  theme: "dark-gray" | "white";
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NewPlaylistButton = ( { onSuccess, theme }: ButtonProps) => {
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: "Nueva lista",
      content: <NewPlaylistForm onSuccess={v=> {
        onSuccess?.(v);
        usingModal.closeModal();
      }} />,
    } );
  };

  return <Button
    theme={theme}
    onClick={openModal}
    left={<span className={styles.left}><Add /></span>}>
    Nueva lista
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
  const formModal = useFormInModal( {
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
