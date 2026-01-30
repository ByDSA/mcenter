import { useMemo, useState } from "react";
import { Episode, EpisodeEntity, EpisodesBySeason } from "$shared/models/episodes";
import { useRouter, useSearchParams } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { PaginationContainer, PaginationButtonProps } from "#modules/ui-kit/Pagination/Pagination";
import { AsyncLoader } from "#modules/utils/AsyncLoader";
import { SeriesEntity } from "../models";
import { SeriesHeader } from "./Header";
import { EpisodesList } from "./Seasons/List";
import styles from "./Series.module.css";

export type SeriesFullPageProps = {
  initialSeason?: string;
  series: SeriesEntity;
  episodesBySeason: EpisodesBySeason;
};

export const SeriesFullPage = ( { series,
  initialSeason,
  episodesBySeason: seasons }: SeriesFullPageProps) => {
  const seasonsEntries = Object.entries(seasons);
  const seasonNames = Object.keys(seasons);
  const searchParams = useSearchParams();
  const totalEpisodes = useMemo(()=>countAllEpisodes(seasons), [seasons]);
  const maxSeason = +(seasonsEntries.at(-1)?.[0] ?? 0);
  const [currentSeason, setCurrentSeason] = useState<string>(() => {
    if (initialSeason && seasonNames.includes(initialSeason))
      return initialSeason;

    if (seasons["1"])
      return "1";

    return seasonsEntries[0][0];
  } );
  const [episodes, setEpisodes] = useState<EpisodeEntity[]>([]);
  const router = useRouter();
  // Componente personalizado para los botones de temporada
  const SeasonButton = (props: PaginationButtonProps) => {
    return (
      <button
        type="button"
        onClick={props.onClick}
        disabled={props.isDisabled}
        className={`${props.isActive ? "ui-kit-pagination-active" : ""} ${styles.seasonButton}`}
        style={{
          padding: "0.5rem 1rem",
          margin: "0 0.25rem",
          borderRadius: "0.25rem",
          border: "1px solid var(--color-gray-600)",
          background: props.isActive ? "var(--color-blue-600)" : "var(--color-gray-800)",
          color: "white",
          cursor: props.isDisabled ? "default" : "pointer",
        }}
      >
        {props.pageValue}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <SeriesHeader
        series={series}
        totalEpisodes={totalEpisodes}
        totalSeasons={maxSeason}
        onUpdate={()=>{ /* empty */ }}
        onDelete={() => {
          router.push(PATH_ROUTES.episodes.series.path);
        }}
      />

      <div className={styles.content}>
        <h2 className={styles.seasonTitle}>Temporada {currentSeason}</h2>

        {
          seasonsEntries.length > 0
            // eslint-disable-next-line multiline-ternary
            ? (
              <PaginationContainer
                customValues={seasonNames}
                initialPageIndex={seasonNames.indexOf(currentSeason)}
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
                <AsyncLoader
                  // Usamos key para forzar recarga cuando cambia la temporada
                  key={currentSeason}
                  // eslint-disable-next-line require-await
                  action={async () => seasons[currentSeason]}
                  onSuccess={(data) => setEpisodes(data)}
                >
                  <p>{countGroupEpisodes(episodes)} episodios</p>
                  <EpisodesList
                    episodes={episodes}
                    series={series}
                    onEpisodesChange={setEpisodes}
                  />
                </AsyncLoader>

              </PaginationContainer>
            ) : (
              <p>No se encontraron temporadas.</p>
            )}
      </div>
    </div>
  );
};

function countAllEpisodes(seasons: EpisodesBySeason): number {
  let total = 0;

  for (const [key, seasonEpisodes] of Object.entries(seasons)) {
    if (key !== "0")
      total += countGroupEpisodes(seasonEpisodes);
  }

  return total;
}

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
