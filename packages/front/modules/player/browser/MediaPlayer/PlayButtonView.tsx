import { Pause, PlayArrow } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { PlayerStatus } from "./BrowserPlayerContext";
import styles from "./PlayButtonView.module.css";

type Props = {
  status: PlayerStatus;
  onClick?: (e: React.MouseEvent<HTMLElement>)=> Promise<void> | void;
  className?: string;
  disabled?: boolean;
  theme?: "blue" | "transparent-white" | "triangle-white" | "white";
};
export const PlayButtonView = ( { status,
  onClick,
  className,
  theme = "white",
  disabled }: Props) => {
  let symbol;

  if (status === "playing")
    symbol = <Pause />;
  else
    symbol = <PlayArrow />;

  return <button
    title={status === "playing" ? "Pausar" : "Reproducir"}
    className={classes(
      styles.playButton,
      !theme.startsWith("triangle-") && styles.circle,
      theme === "blue" && styles.themeBlue,
      theme === "white" && styles.themeWhite,
      theme === "transparent-white" && styles.themeTransparentWhite,
      theme === "triangle-white" && styles.themeTriangleWhite,
      disabled && styles.disabled,
      className,
    )}
    onMouseDown={(e) => {
      e.preventDefault(); // Evita que el botón pida el foco al navegador
    }}
    onClick={disabled ? undefined : onClick}
  >
    {symbol}
  </button>;
};
