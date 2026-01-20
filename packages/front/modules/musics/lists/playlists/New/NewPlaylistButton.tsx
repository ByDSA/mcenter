import { Add } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import styles from "./NewPlaylistButton.module.css";
import { NewPlaylistModalProps, useNewPlaylistModal } from "./Modal";

type ButtonProps = NewPlaylistModalProps & {
  theme: "dark-gray" | "white";
};

export const NewPlaylistButton = ( { onSuccess, theme }: ButtonProps) => {
  const { openModal } = useNewPlaylistModal( {
    onSuccess,
  } );

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
