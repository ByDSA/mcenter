import { Favorite } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { classes } from "#modules/utils/styles";
import { logger } from "#modules/core/logger";
import styles from "./FavButton.module.css";

type Props = {
  value: boolean;
  className?: string;
  onFavorite?: (e: React.MouseEvent)=> Promise<void>;
  onUnfavorite?: (e: React.MouseEvent)=> Promise<void>;
  disabled?: boolean;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FavButton = ( { className,
  value = false,
  disabled,
  onFavorite,
  onUnfavorite }: Props) => {
  const onClick = onUnfavorite && onFavorite
    ? async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (value) {
        try {
          await onUnfavorite?.(e);
        } catch {
          logger.error("No se pudo quitar de favoritos.");
        }
      } else {
        try {
          await onFavorite?.(e);
        } catch {
          logger.error("No se pudo añadir a favoritos.");
        }
      }
    }
    : undefined;

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
