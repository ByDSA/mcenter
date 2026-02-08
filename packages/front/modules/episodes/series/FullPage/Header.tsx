import type { SeriesFullPageProps } from "./Series";
import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { useImageCover } from "#modules/image-covers/hooks";
import { DateTag } from "#modules/resources/FullPage/DateTag/DateTag";
import { HeaderList } from "#modules/resources/FullPage/HeaderList";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { SeriesSettingsButton } from "../SettingsButton/SettingsButton";
import { useSeries } from "../hooks";

type Props = Pick<SeriesFullPageProps, "updateEpisodesBySeason"> & {
  seriesId: string;
};

export const SeriesHeader = ( { seriesId,
  updateEpisodesBySeason }: Props) => {
  const { data: series } = useSeries(seriesId);
  const { data: imageCover } = useImageCover(series?.imageCoverId ?? null);
  const router = useRouter();

  if (!series)
    return <ContentSpinner />;

  const infoItems = [
    <span key="seasons">{series.metadata?.countSeasons ?? "-"} {series.metadata?.countSeasons === 1
      ? "temporada"
      : "temporadas"}</span>,
    <span key="episodes">{series.metadata?.countEpisodes ?? "-"} episodios</span>,
    <DateTag key="date" date={series.addedAt} />,
  ];

  return (
    <HeaderList
      title={series.name}
      cover={
        <MusicImageCover
          title={series.name}
          cover={imageCover}
          icon={{
            element: <SeriesIcon />,
          }}
          size="medium"
        />
      }
      settings={
        <SeriesSettingsButton
          seriesId={seriesId}
          onDelete={() => router.push(PATH_ROUTES.episodes.frontend.lists.path)}
          onUploadEachEpisode={async ()=>{
            await updateEpisodesBySeason();
            await useSeries.fetch(seriesId);
          }}
        />
      }
      info={infoItems}
    />
  );
};
