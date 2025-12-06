import { classes } from "#modules/utils/styles";
import { MusicsIcon } from "../MusicsIcon";
import styles from "./PlaylistCover.module.css";

type Props = {
  className?: string;
  coverUrl?: string;
  alt?: string;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistCover = (props?: Props) => {
  return <div className={classes(styles.playlistCover, props?.className)}>
    {props?.coverUrl
      ? (
        <img
          src={props.coverUrl}
          alt={props.alt}
          className={styles.playlistCoverImage}
        />
      )
      : (
        <span className={styles.playlistCoverIcon}>
          <MusicsIcon />
        </span>
      )}
  </div>;
};
