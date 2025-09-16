import { MoreVert } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import styles from "./SettingsButton.module.css";

type Props = {
  onClick?: (e: React.MouseEvent)=> void;
  theme?: "dark" | "light";
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SettingsButton = ( { onClick, theme: mode }: Props) => <button
  className={classes(styles.controlButton, mode === "light" && styles.overWhite)}
  onClick={(e)=> {
    e.preventDefault(); // Previene la navegación del enlace
    e.stopPropagation(); // Evita que el evento burbujee
    onClick?.(e);
  }}
>
  <MoreVert />
</button>;
