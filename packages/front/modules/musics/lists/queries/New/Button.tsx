import { Add } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import styles from "../../playlists/New/NewPlaylistButton.module.css";
import { NewQueryModalProps, useNewQueryModal } from "./Modal";

type ButtonProps = NewQueryModalProps & {
  theme: "dark-gray" | "white";
};

export const NewQueryButton = ( { onSuccess, theme }: ButtonProps) => {
  const { openModal } = useNewQueryModal( {
    onSuccess,
  } );

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
