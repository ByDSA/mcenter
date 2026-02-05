import type { EpisodesList } from "./List";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { useImageCover } from "#modules/image-covers/hooks";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EditEpisodeContextMenuItem } from "#modules/episodes/Edit/ContextMenu";
import { EpisodeLatestViewsContextMenuItem } from "#modules/episodes/history/LatestViews/ContextMenuItem";
import { DeleteEpisodeContextMenuItem } from "#modules/episodes/Delete/ContextMenuItem";
import { CopyEpisodeLinkContextMenuItemCurrentCtx } from "#modules/episodes/SettingsButton/CopyLinkContextMenuItem";
import { PropsOf } from "#modules/utils/react";
import { DurationView, WeightView } from "#modules/history";
import { useUser } from "#modules/core/auth/useUser";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { useEpisode } from "#modules/episodes/hooks";
import { ResourceEntryLoading } from "#modules/resources/ListItem/ResourceEntryLoading";
import { SeriesIcon } from "../../SeriesIcon/SeriesIcon";
import { useSeries } from "../../hooks";
import styles from "./ListItem.module.css";

type Props = Pick<PropsOf<typeof EpisodesList>, "onDelete"> & {
  episodeId: string;
  seriesId: string;
};

export const EpisodeListItem = ( { episodeId, seriesId, onDelete }: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const { data: series } = useSeries(seriesId);
  const { data: episode } = useEpisode(episodeId);
  const coverId = episode?.imageCoverId ?? series?.imageCoverId;
  const { data: imageCover } = useImageCover(coverId ?? null);
  const user = useUser();
  const hasUser = !!user;
  let subtitleSeen: PropsOf<typeof ResourceSubtitle>["items"][0];

  if (!episode)
    return <ResourceEntryLoading />;

  assertIsDefined(episode.fileInfos);

  if (hasUser) {
    subtitleSeen = {
      text: episode.userInfo?.lastTimePlayed === 0 || !episode.userInfo
        ? "Nunca visto"
        : `Visto el ${formatDateDDMMYYY(new Date(episode.userInfo.lastTimePlayed * 1_000))}`,
    };
  }

  const fileInfo = episode.fileInfos[0];

  assertIsDefined(fileInfo.mediaInfo.duration);
  const duration = Math.min(fileInfo.mediaInfo.duration, fileInfo.end ?? Infinity)
    - Math.max(fileInfo.start ?? 0);

  return (
    <ResourceEntry
      mainTitle={episode.title}
      mainTitleHref={PATH_ROUTES.episodes.slug.withParams(
        episode.compKey.seriesKey,
        episode.compKey.episodeKey,
      )}
      subtitle={<ResourceSubtitle items={[{
        className: styles.episodeKey,
        text: episode.compKey.episodeKey,
      }, subtitleSeen]} />}
      imageCover={imageCover}
      imageCoverDefaultIcon={{
        element: <SeriesIcon />,
      }}
      right={<>
        <DurationView duration={duration} />
        {episode.userInfo && <WeightView weight={episode.userInfo.weight} />}
      </>}
      settings={
        <SettingsButton
          theme="dark"
          onClick={(e) => {
            openMenu( {
              event: e,
              content: (
                <LocalDataProvider data={episode}>
                  <EditEpisodeContextMenuItem initialData={episode} />
                  <CopyEpisodeLinkContextMenuItemCurrentCtx />
                  <EpisodeLatestViewsContextMenuItem episodeId={episodeId} />
                  <DeleteEpisodeContextMenuItem
                    onActionSuccess={onDelete ? ()=>onDelete(episode) : undefined}
                  />
                </LocalDataProvider>
              ),
            } );
          }}
        />
      }
    />
  );
};
