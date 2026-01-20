import { Add } from "@mui/icons-material";
import { Button } from "#modules/ui-kit/form/input/Button/Button";
import styles from "../../playlists/New/NewPlaylistButton.module.css";
import { NewSmartPlaylistModalProps, useNewSmartPlaylistModal } from "./Modal";

type ButtonProps = NewSmartPlaylistModalProps & {
  theme: "dark-gray" | "white";
};

export const NewSmartPlaylistButton = ( { onSuccess, theme }: ButtonProps) => {
  const { openModal } = useNewSmartPlaylistModal( {
    onSuccess,
  } );

  return (
    <Button
      theme={theme}
      onClick={openModal}
      left={<span className={styles.left}><Add /></span>}
    >
      Nueva Smart Playlist
    </Button>
  );
};
