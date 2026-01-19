import { Add } from "@mui/icons-material";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import styles from "./NewPlaylistButton.module.css";
import { NewPlaylistForm } from "./Form";

// Importar el componente creado arriba
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
      content: (
        <NewPlaylistForm
          onSuccess={(v) => {
            onSuccess?.(v);
            usingModal.closeModal();
          }}
        />
      ),
    } );
  };

  return (
    <Button
      theme={theme}
      onClick={openModal}
      left={
        <span className={styles.left}>
          <Add />
        </span>
      }
    >
      Nueva lista
    </Button>
  );
};
