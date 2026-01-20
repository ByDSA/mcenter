import { PlayButtonView } from "#modules/player/browser/MediaPlayer/PlayButtonView";
import { classes } from "#modules/utils/styles";
import styles from "./PlayButton.module.css";

type Props = Omit<Parameters<typeof PlayButtonView>[0], "theme">;
export const ResourcePlayButtonView = ( { className, ...props }: Props) => {
  return <PlayButtonView
    theme={"blue"}
    {...props}
    className={classes(styles.button, className)}
  />;
};
