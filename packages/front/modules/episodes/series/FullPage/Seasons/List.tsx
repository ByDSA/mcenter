import { EpisodeEntity } from "$shared/models/episodes";
import styles from "./List.module.css";
import { EpisodeListItem } from "./ListItem";

type Props = {
  episodes?: EpisodeEntity[];
  seriesId: string;
  onDelete: (episode: EpisodeEntity)=> Promise<void> | void;
};

export const EpisodesList = ( { episodes, seriesId, onDelete }: Props) => {
  if (!episodes || episodes.length === 0)
    return <p>No hay episodios en esta temporada.</p>;

  return (
    <div className={styles.list}>
      {episodes.map((episode) => (
        <EpisodeListItem
          key={episode.id}
          episodeId={episode.id}
          seriesId={seriesId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
