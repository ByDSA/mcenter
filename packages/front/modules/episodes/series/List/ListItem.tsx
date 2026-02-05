import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { useImageCover } from "#modules/image-covers/hooks";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { useArrayData } from "#modules/utils/array-data-context";
import { frontendUrl } from "#modules/requests";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { SeriesSettingsButton } from "../SettingsButton/SettingsButton";
import { SeriesEntity } from "../models";
import { SeriesIcon } from "../SeriesIcon/SeriesIcon";
import { useSeries } from "../hooks";
import styles from "./ListItem.module.css";

type Props = {
  seriesId: string;
  index: number;
};
export const SeriesListItem = (props: Props) => {
  const { data: series } = useSeries(props.seriesId);
  const { data: imageCover } = useImageCover(series?.imageCoverId ?? null);
  const { removeItemByIndex } = useArrayData<SeriesEntity>();
  const router = useRouter();
  const url = frontendUrl(
    PATH_ROUTES.episodes.frontend.lists.withParams( {
      serieId: props.seriesId,
    } ),
  );

  if (!series)
    return <ContentSpinner />;

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
      <span className={styles.title}>{series.name}</span>
      <footer className={styles.footer}>
        <aside className={styles.info}>
          {series.countSeasons !== undefined && (
            <span className={styles.subInfo}>{series.countSeasons} temporadas</span>
          )}
          {series.countEpisodes !== undefined && (
            <span className={styles.subInfo}>{series.countEpisodes} episodes</span>
          )}
        </aside>
        <aside>
          <LocalDataProvider data={series}>
            <SeriesSettingsButton
              seriesId={props.seriesId}
              onDelete={() => {
                removeItemByIndex(props.index);
              }}
              onUploadEachEpisode={async ()=> {
                await useSeries.fetch(props.seriesId);
              }}
            />
          </LocalDataProvider>
        </aside>
      </footer>
    </a>
  );
};
