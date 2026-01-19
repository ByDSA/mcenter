import { useImageCover } from "#modules/image-covers/hooks";
import { MusicPlaylistEntity } from "../models";
import { MusicImageCover } from "../../../MusicCover";
import styles from "./Item.module.css";

type Props = {
  data: MusicPlaylistEntity;
  onClick: ()=> void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistSelectorItem = (props: Props) => {
  const { data } = props;
  let { data: cover } = useImageCover(data.imageCoverId ?? null);

  return <div className={styles.item} onClick={props.onClick}>
    <MusicImageCover
      className={styles.cover}
      title={data.name}
      cover={cover}
    />
    <section>
      <div className={styles.name}>{data.name}</div>
      <div className={styles.length}>{data.list.length} canciones</div>
    </section>
  </div>;
};
