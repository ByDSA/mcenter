import { MoreVert } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./SettingsButton.module.css";

type Props = {
  onClick?: (e: React.MouseEvent<HTMLElement>)=> void;
  theme?: "dark" | "light";
  className?: string;
};
export const SettingsButton = ( { onClick, className, theme: mode }: Props) => <button
  className={classes(styles.controlButton, className, mode === "light" && styles.overWhite)}
  onClick={(e)=> {
    e.preventDefault(); // Previene la navegación del enlace
    e.stopPropagation(); // Evita que el evento burbujee
    onClick?.(e);
  }}
>
  <MoreVert />
</button>;
