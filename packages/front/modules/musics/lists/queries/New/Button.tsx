import { Add } from "@mui/icons-material";
import { useModal } from "#modules/ui-kit/modal/ModalContext";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import styles from "../../playlists/New/NewPlaylistButton.module.css";
import { MusicQueryEntity } from "../models";
import { NewQueryForm } from "./Form";
import modalStyles from "./modal.module.css";

type ButtonProps = {
  onSuccess?: (newQuery: MusicQueryEntity)=> void;
  theme: "dark-gray" | "white";
};

export const NewQueryButton = ( { onSuccess, theme }: ButtonProps) => {
  const usingModal = useModal();
  const openModal = () => {
    return usingModal.openModal( {
      title: "Nueva Query",
      className: modalStyles.modal,
      content: (
        <NewQueryForm
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
      left={<span className={styles.left}><Add /></span>}
    >
      Nueva query
    </Button>
  );
};
