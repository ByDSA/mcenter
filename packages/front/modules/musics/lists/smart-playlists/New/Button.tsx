import { Add } from "@mui/icons-material";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "../../playlists/New/NewPlaylistButton.module.css";
import { NewSmartPlaylistModalProps, useNewSmartPlaylistModal } from "./Modal";

type ButtonProps = NewSmartPlaylistModalProps & {
  theme: "dark-gray" | "white";
};

export const NewSmartPlaylistButton = ( { onSuccess, theme }: ButtonProps) => {
  const { LL } = useI18nContext();
  const { openModal } = useNewSmartPlaylistModal( {
    onSuccess,
  } );

  return (
    <DaButton
      theme={theme}
      onClick={openModal}
      left={<span className={styles.left}><Add /></span>}
    >
      {LL.modules.musics.lists.smartPlaylists.new()}
    </DaButton>
  );
};
