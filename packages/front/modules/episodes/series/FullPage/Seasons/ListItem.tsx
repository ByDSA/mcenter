import type { EpisodesList } from "./List";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { Visibility } from "@mui/icons-material";
import { UserRoleName } from "$shared/models/auth";
import { EpisodeUserInfo } from "$shared/models/episodes";
import { useImageCover } from "#modules/image-covers/hooks";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EditEpisodeContextMenuItem } from "#modules/episodes/Edit/ContextMenu";
import { EpisodeLatestViewsContextMenuItem } from "#modules/episodes/history/LatestViews/ContextMenuItem";
import { DeleteEpisodeContextMenuItem } from "#modules/episodes/Delete/ContextMenuItem";
import { ShareEpisodeLinkContextMenuItemCurrentCtx } from "#modules/episodes/SettingsButton/ShareContextMenuItem";
import { PropsOf } from "#modules/utils/react";
import { DurationView, MetadataView, WeightView } from "#modules/history";
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
  const { user } = useUser();
  const hasUser = !!user;
  let subtitleSeen: PropsOf<typeof ResourceSubtitle>["items"][0];

  if (!episode || !series)
    return <ResourceEntryLoading />;

  assertIsDefined(episode.fileInfos);

  if (hasUser) {
    subtitleSeen = {
      customContent: <LastSeenElement
        userInfo={episode.userInfo}
        className={styles.seen}
      />,
    };
  }

  const fileInfo = episode.fileInfos[0];

  assertIsDefined(fileInfo.mediaInfo.duration);
  const duration = Math.min(fileInfo.mediaInfo.duration, fileInfo.end ?? Infinity)
    - Math.max(fileInfo.start ?? 0);
  const isAdmin = !!user?.roles.find(r=>r.name === UserRoleName.ADMIN);

  return (
    <ResourceEntry
      mainTitle={episode.title}
      mainTitleHref={PATH_ROUTES.episodes.frontend.lists.episode.withParams(
        {
          episodeId: episode.id,
        },
      )}
      subtitle={<ResourceSubtitle items={[{
        className: styles.episodeKey,
        text: episode.episodeKey,
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
                  {isAdmin && <EditEpisodeContextMenuItem initialData={episode} />}
                  {hasUser && <EpisodeLatestViewsContextMenuItem episodeId={episodeId} />}
                  <ShareEpisodeLinkContextMenuItemCurrentCtx />
                  {isAdmin && <DeleteEpisodeContextMenuItem
                    onActionSuccess={onDelete ? ()=>onDelete(episode) : undefined}
                  />}
                </LocalDataProvider>
              ),
            } );
          }}
        />
      }
    />
  );
};

type LastSeenProps = {
  userInfo: EpisodeUserInfo | undefined;
  className?: string;
};
export function LastSeenElement( { userInfo, className }: LastSeenProps) {
  const neverSeen = userInfo?.lastTimePlayed === null || !userInfo;
  const txt = neverSeen
    ? "Nunca visto"
    : `${formatDateDDMMYYY(userInfo!.lastTimePlayed!)}`;

  return <MetadataView
    icon={<Visibility/>}
    className={className}
    title={`Visto por última vez: ${txt}`}
    txt={txt} />;
}
