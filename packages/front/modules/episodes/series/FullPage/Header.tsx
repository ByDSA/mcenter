import { SeriesEntity } from "$shared/models/episodes/series";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { useImageCover } from "#modules/image-covers/hooks";
import { DateTag } from "#modules/resources/FullPage/DateTag/DateTag";
import { HeaderList } from "#modules/resources/FullPage/HeaderList";
import { SeriesSettingsButton } from "../SettingsButton/SettingsButton";

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
  const infoItems = [
    <span key="seasons">{totalSeasons} {totalSeasons === 1 ? "temporada" : "temporadas"}</span>,
    <span key="episodes">{totalEpisodes} episodios</span>,
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
          onUpdate={() => {
            // La actualización se maneja en el padre, pero el botón de edición está en la cover
          }}
        />
      }
      settings={
        <SeriesSettingsButton
          series={series}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      }
      info={infoItems}
    />
  );
};
