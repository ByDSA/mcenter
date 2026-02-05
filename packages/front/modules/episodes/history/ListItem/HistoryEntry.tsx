import React, { memo } from "react";
import { EpisodeEntity } from "$shared/models/episodes";
import { PATH_ROUTES } from "$shared/routing";
import { HistoryTimeView, WeightView } from "#modules/history";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { backendUrl } from "#modules/requests";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { copyText } from "#modules/musics/lists/playlists/utils";
import { logger } from "#modules/core/logger";
import { useImageCover } from "#modules/image-covers/hooks";
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { useEpisode } from "#modules/episodes/hooks";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
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
  const { data: episode } = useEpisode(episodeId);
  const { openMenu } = useContextMenuTrigger();
  const { data: imageCover } = useImageCover(
    episode?.imageCoverId ?? episode?.serie?.imageCoverId ?? null,
  );

  if (!episode)
    return <ResourceEntryLoading />;

  return <ResourceEntry
    mainTitle={episode.title}
    subtitle={<EpisodeSubtitle episode={episode} />}
    right={<>
      <HistoryTimeView timestamp={historyEntry.date.timestamp} />
      {episode.userInfo && <WeightView weight={episode.userInfo.weight} />}
    </>}
    imageCover={imageCover ?? null}
    imageCoverDefaultIcon={{
      element: <SeriesIcon />,
    }}
    settings={<SettingsButton
      onClick={(e)=> {
        openMenu( {
          event: e,
          content: <>
            <EditEpisodeContextMenuItem initialData={episode}/>
            <ContextMenuItem
              label="Copiar backend URL"
              onClick={async (event) => {
                event.stopPropagation();
                const { episodeKey, seriesKey } = episode.compKey;

                await copyText(
                  backendUrl(
                    PATH_ROUTES.episodes.slug.withParams(seriesKey, episodeKey),
                  ),
                );
                logger.info("Texto copiado.");
              }}
            />
            <EpisodeLatestViewsContextMenuItem
              episodeId={episode.id}
              maxTimestamp={historyEntry.date.timestamp}
            />
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
  return <ResourceSubtitle items={[{
    text: episode.serie?.name!,
    className: classes(styles.subtitle, "ellipsis"),
  }, {
    text: episode.compKey.episodeKey,
    className: classes(styles.subtitle),
  }]} />;
} );
