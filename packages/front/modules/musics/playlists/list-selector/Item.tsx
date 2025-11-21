import { PlaylistEntity } from "../Playlist";
import styles from "./Item.module.css";

type Props = {
  data: PlaylistEntity;
  onClick: ()=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistSelectorItem = (props: Props) => {
  const { data } = props;

  return <div className={styles.item} onClick={props.onClick}>
    <div className={styles.name}>{data.name}</div>
    <div className={styles.length}>{data.list.length} canciones</div>
  </div>;
};
