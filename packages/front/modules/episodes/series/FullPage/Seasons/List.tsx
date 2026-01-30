import { EpisodeEntity } from "$shared/models/episodes";
import { SeriesEntity } from "$shared/models/episodes/series";
import { ArrayDataProvider, useArrayData } from "#modules/utils/array-data-context";
import styles from "./List.module.css";
import { EpisodeListItem } from "./ListItem";

type Props = {
  episodes: EpisodeEntity[];
  series: SeriesEntity;
  onEpisodesChange: (newEpisodes: EpisodeEntity[])=> void;
};

export const EpisodesList = ( { episodes, series, onEpisodesChange }: Props) => {
  return (
    <ArrayDataProvider
      data={episodes}
      setData={onEpisodesChange as any}
    >
      <EpisodesListContent series={series} />
    </ArrayDataProvider>
  );
};

const EpisodesListContent = ( { series }: { series: SeriesEntity } ) => {
  const { data, setItemByIndex, removeItemByIndex } = useArrayData<EpisodeEntity>();

  if (!data || data.length === 0)
    return <p>No hay episodios en esta temporada.</p>;

  return (
    <div className={styles.list}>
      {data.map((episode, index) => (
        <EpisodeListItem
          key={episode.id}
          episode={episode}
          series={series}
          setEpisode={(val) => setItemByIndex(index, val)}
          onDelete={() => removeItemByIndex(index)}
        />
      ))}
    </div>
  );
};
