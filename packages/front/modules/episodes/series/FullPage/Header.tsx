import { SeriesEntity } from "$shared/models/episodes/series";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { useImageCover } from "#modules/image-covers/hooks";
import { Separator } from "#modules/resources/Separator/Separator";
import { DateTag } from "#modules/musics/lists/playlists/FullPage/Header";
import { SeriesSettingsButton } from "../SettingsButton/SettingsButton";
import styles from "./Header.module.css";

type Props = {
  series: SeriesEntity;
  totalSeasons: number;
  totalEpisodes: number;
  onUpdate: (newData: SeriesEntity)=> void;
  onDelete: ()=> void;
};

export const SeriesHeader = ( { series,
  totalSeasons,
  totalEpisodes,
  onUpdate,
  onDelete }: Props) => {
  const { data: imageCover } = useImageCover(series.imageCoverId);

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <MusicImageCover
          title={series.name}
          className={styles.cover}
          cover={imageCover}
          icon={{
            element: <SeriesIcon />,
          }}
          editable
          onUpdate={(newCover) => {
            // Lógica para actualizar la cover si es necesario,
            // aunque el componente padre manejará la actualización de la serie
          }}
        />

        <div className={styles.info}>
          <h1 className={styles.title}>{series.name}</h1>
        </div>
      </div>

      <div className={styles.controls}>
        <SeriesSettingsButton
          series={series}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span>{totalSeasons} {totalSeasons === 1 ? "temporada" : "temporadas"}</span>
          </div>
          <Separator />
          <div className={styles.statItem}>
            <span>{totalEpisodes} episodes</span>
          </div>
          <Separator />
          <DateTag date={series.addedAt} />
        </div>
      </div>
    </div>
  );
};
