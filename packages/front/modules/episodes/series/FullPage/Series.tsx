import { useEffect, useState } from "react";
import { Episode, EpisodeEntity, EpisodesBySeason } from "$shared/models/episodes";
import { useRouter, useSearchParams } from "next/navigation";
import { PaginationContainer } from "#modules/ui-kit/Pagination/Pagination";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { ResourceFullPage } from "#modules/resources/FullPage/FullPage/FullPage";
import { useLocalData } from "#modules/utils/local-data-context";
import { useSeries } from "../hooks";
import { SeriesHeader } from "./Header";
import { EpisodesList } from "./Seasons/List";
import styles from "./Series.module.css";
import { SeasonButton } from "./SeasonButton";

export type SeriesFullPageProps = {
  initialSeason?: string;
  seriesId: string;
  updateEpisodesBySeason: ()=> Promise<unknown>;
};

export const SeriesFullPageCurrentCtx = ( { seriesId,
  initialSeason, updateEpisodesBySeason }: SeriesFullPageProps) => {
  const { data: episodesBySeason } = useLocalData<EpisodesBySeason>();
  const seasonsEntries = Object.entries(episodesBySeason);
  const seasonNames = Object.keys(episodesBySeason);
  const searchParams = useSearchParams();
  const [currentSeason, setCurrentSeason] = useState<string | null>(() => {
    if (seasonsEntries.length === 0)
      return null;

    if (initialSeason && seasonNames.includes(initialSeason))
      return initialSeason;

    if (episodesBySeason["1"])
      return "1";

    return seasonsEntries[0][0];
  } );
  const [episodes, setEpisodes] = useState<EpisodeEntity[]>([]);

  useEffect(()=> {
    if (episodesBySeason && currentSeason !== null) {
      const updated = episodesBySeason[currentSeason];

      setEpisodes(updated ?? []);
    }
  }, [episodesBySeason]);
  const router = useRouter();

  // Componente personalizado para los botones de temporada
  return (
    <ResourceFullPage>
      <SeriesHeader
        seriesId={seriesId}
        updateEpisodesBySeason={updateEpisodesBySeason}
      />

      <div className={styles.content}>
        <h2 className={styles.seasonTitle}>Temporada {currentSeason}</h2>

        {
          seasonsEntries.length > 0
            // eslint-disable-next-line multiline-ternary
            ? (
              <PaginationContainer
                customValues={seasonNames}
                initialPageIndex={currentSeason ? seasonNames.indexOf(currentSeason) : null}
                position="top"
                renderButton={SeasonButton}
                showPageInfo={false}
                onChange={(details) => {
                  const seasonName = details.pageValue.toString();

                  router.push(`?${new URLSearchParams( {
                    ...Object.fromEntries(searchParams),
                    season: seasonName,
                  } ).toString()}`);
                  setCurrentSeason(seasonName);
                }}
              >
                {currentSeason !== null && <AsyncLoader
                  // Usamos key para forzar recarga cuando cambia la temporada
                  key={currentSeason}
                  // eslint-disable-next-line require-await
                  action={async () => episodesBySeason[currentSeason]}
                  onSuccess={(data) => setEpisodes(data)}
                >
                  <p>{countGroupEpisodes(episodes)} episodios</p>
                  <EpisodesList
                    episodes={episodes}
                    seriesId={seriesId}
                    onDelete={async (episode)=> {
                      setEpisodes(old => {
                        if (!old)
                          return old;

                        return old.filter(e=>e.id !== episode.id);
                      } );

                      await useSeries.fetch(seriesId);
                    }}
                  />
                </AsyncLoader>}

              </PaginationContainer>
            ) : (
              <p>No se encontraron temporadas.</p>
            )}
      </div>
    </ResourceFullPage>
  );
};

function countGroupEpisodes(episodes: Episode[]): number {
  let total = 0;

  for (const e of episodes) {
    if (e.count === undefined)
      total++;
    else
      total += e.count;
  }

  return total;
}
