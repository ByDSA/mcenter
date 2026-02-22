import React, { memo } from "react";
import { EpisodeEntity } from "$shared/models/episodes";
import { dateToTimestampInSeconds } from "$shared/utils/time/timestamp";
import { getFirstAvailableFileInfoOrFirst, isFileInfoUnavailable } from "$shared/models/file-info-common/file-info";
import { HistoryTimeView, WeightView } from "#modules/history";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useImageCover } from "#modules/image-covers/hooks";
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { useEpisode } from "#modules/episodes/hooks";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
import { useSeries } from "#modules/episodes/series/hooks";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { ShareEpisodeLinkContextMenuItemCurrentCtx } from "#modules/episodes/SettingsButton/ShareContextMenuItem";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EpisodeLatestViewsContextMenuItem } from "../LatestViews/ContextMenuItem";
import { EditEpisodeContextMenuItem } from "../../Edit/ContextMenu";
import { DeleteHistoryEntryContextMenuItem } from "../Delete/Delete";
import { EpisodeHistoryEntryEntity } from "../models";
import styles from "./HistoryEntry.module.css";

type Props = {
  historyEntry: EpisodeHistoryEntryEntity;
  episodeId: string;
  showDate?: boolean;
  onDelete: (entry: EpisodeHistoryEntryEntity)=> Promise<void>;
};
export const EpisodeHistoryEntryElement = React.memo((
  { episodeId, historyEntry, onDelete }: Props,
) =>{
  let { data: episode } = useEpisode(episodeId);
  const { data: series } = useSeries(episode?.seriesId ?? null, {
    debounce: true,
    notExpandCountEpisodes: true,
    notExpandCountSeasons: true,
    notExpandImageCover: true,
  } );
  const imageCoverId = episode?.imageCoverId ?? series?.imageCoverId;
  const { data: imageCover } = useImageCover(imageCoverId ?? null, {
    debounce: true,
  } );
  const { openMenu } = useContextMenuTrigger();

  if (!episode || !episode.fileInfos || !series || (imageCoverId && !imageCover))
    return <ResourceEntryLoading />;

  const fileInfo = getFirstAvailableFileInfoOrFirst(episode.fileInfos);
  const isUnavailable = isFileInfoUnavailable(fileInfo);

  return <ResourceEntry
    mainTitle={episode.title}
    subtitle={<EpisodeSubtitle episode={episode} />}
    right={<>
      <HistoryTimeView timestamp={dateToTimestampInSeconds(historyEntry.date)} />
      {episode.userInfo && <WeightView weight={episode.userInfo.weight} />}
    </>}
    disabled={isUnavailable}
    imageCover={imageCover}
    imageCoverDefaultIcon={{
      element: <SeriesIcon />,
    }}
    settings={<SettingsButton
      onClick={(e)=> {
        openMenu( {
          event: e,
          content: <>
            <EditEpisodeContextMenuItem initialData={episode}/>
            <EpisodeLatestViewsContextMenuItem
              episodeId={episode.id}
              maxTimestamp={dateToTimestampInSeconds(historyEntry.date)}
            />
            <LocalDataProvider data={episode}>
              {!isUnavailable && <ShareEpisodeLinkContextMenuItemCurrentCtx />}
            </LocalDataProvider>
            <DeleteHistoryEntryContextMenuItem value={historyEntry} onActionSuccess={onDelete}/>
          </>,
        } );
      }}
    />}
  />;
} );

type EpisodeSubtitleProps = {
  episode: EpisodeEntity;
};
export const EpisodeSubtitle = memo(( { episode }: EpisodeSubtitleProps) => {
  const { data: series } = useSeries(episode.seriesId, {
    debounce: true,
    notExpandCountEpisodes: true,
    notExpandCountSeasons: true,
    notExpandImageCover: true,
  } );

  if (!series)
    return <ContentSpinner />;

  return <ResourceSubtitle items={[{
    text: series.name,
    className: classes(styles.subtitle, "ellipsis"),
  }, {
    text: episode.episodeKey,
    className: classes(styles.subtitle),
  }]} />;
} );
