import { Favorite } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { classes } from "#modules/utils/styles";
import { logger } from "#modules/core/logger";
import styles from "./FavButton.module.css";

type Props = {
  initialValue?: boolean;
  className?: string;
  onFavorite: (e: React.MouseEvent)=> Promise<void>;
  onUnfavorite: (e: React.MouseEvent)=> Promise<void>;
  disabled?: boolean;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FavButton = ( { className,
  initialValue = false,
  disabled,
  onFavorite,
  onUnfavorite }: Props) => {
  const [value, setValue] = useState(initialValue);
  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (value) {
      try {
        setValue(false);
        await onUnfavorite(e);
      } catch {
        setValue(true);
        logger.error("No se pudo quitar de favoritos.");
      }
    } else {
      setValue(true);
      try {
        await onFavorite(e);
      } catch {
        setValue(false);
        logger.error("No se pudo añadir a favoritos.");
      }
    }
  };

  return <IconButton
    size="small"
    className={classes(
      className,
      styles.favButton,
      value && styles.active,
      disabled && styles.disabled,
    )}
    onClick={(e)=>disabled ? undefined : onClick?.(e)}
  >
    <Favorite />
  </IconButton>;
};
