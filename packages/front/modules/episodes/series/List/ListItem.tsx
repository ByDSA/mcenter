import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { useImageCover } from "#modules/image-covers/hooks";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { useArrayData } from "#modules/utils/array-data-context";
import { frontendUrl } from "#modules/requests";
import { SeriesSettingsButton } from "../SettingsButton/SettingsButton";
import { SeriesEntity } from "../models";
import { SeriesIcon } from "../SeriesIcon/SeriesIcon";
import styles from "./ListItem.module.css";

type Entity = SeriesEntity;
type Props = {
  data: Entity;
  index: number;
};
export const SeriesListItem = (props: Props) => {
  const { data: imageCover } = useImageCover(props.data.imageCoverId);
  const { removeItemByIndex, setItemByIndex } = useArrayData<SeriesEntity>();
  const router = useRouter();
  const url = frontendUrl(
    PATH_ROUTES.episodes.frontend.lists.withParams( {
      serieId: props.data.id,
    } ),
  );

  return (
    <a
      className={styles.item}
      href={url}
      onClick={(e)=> {
        e.preventDefault();
        router.push(url);
      }}>
      <MusicImageCover
        className={styles.cover}
        icon={{
          element: <SeriesIcon />,
        }}
        cover={imageCover}
        size="medium"
      />
      <span className={styles.title}>{props.data.name}</span>
      <footer className={styles.footer}>
        <aside className={styles.info}>
          {props.data.countSeasons !== undefined && (
            <span className={styles.subInfo}>{props.data.countSeasons} temporadas</span>
          )}
          {props.data.countEpisodes !== undefined && (
            <span className={styles.subInfo}>{props.data.countEpisodes} episodes</span>
          )}
        </aside>
        <aside>
          <SeriesSettingsButton
            series={props.data}
            onDelete={() => removeItemByIndex(props.index)}
            onUpdate={(newData) => setItemByIndex(props.index, newData)}
          />
        </aside>
      </footer>
    </a>
  );
};
