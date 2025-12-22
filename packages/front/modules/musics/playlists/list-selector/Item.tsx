import { MusicPlaylistEntity } from "../models";
import { MusicImageCover } from "../../MusicCover";
import styles from "./Item.module.css";

type Props = {
  data: MusicPlaylistEntity;
  onClick: ()=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistSelectorItem = (props: Props) => {
  const { data } = props;

  return <div className={styles.item} onClick={props.onClick}>
    <MusicImageCover
      className={styles.cover}
      img={{
        alt: data.name,
      }}
    />
    <section>
      <div className={styles.name}>{data.name}</div>
      <div className={styles.length}>{data.list.length} canciones</div>
    </section>
  </div>;
};
