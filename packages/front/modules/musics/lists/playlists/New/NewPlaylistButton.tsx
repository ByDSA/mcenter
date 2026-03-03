import { Add } from "@mui/icons-material";
import { DaButton } from "#modules/ui-kit/form/input/Button/Button";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import styles from "./NewPlaylistButton.module.css";
import { NewPlaylistModalProps, useNewPlaylistModal } from "./Modal";

type ButtonProps = NewPlaylistModalProps & {
  theme: "dark-gray" | "white";
};

export const NewPlaylistButton = ( { onSuccess, theme }: ButtonProps) => {
  const { LL } = useI18nContext();
  const { openModal } = useNewPlaylistModal( {
    onSuccess,
  } );

  return (
    <DaButton
      theme={theme}
      onClick={openModal}
      left={
        <span className={styles.left}>
          <Add />
        </span>
      }
    >
      {LL.uikit.actions.new()}
    </DaButton>
  );
};
