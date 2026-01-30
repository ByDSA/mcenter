import { EpisodeEntity } from "$shared/models/episodes";
import { SeriesEntity } from "$shared/models/episodes/series";
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
import { CopyEpisodeLinkContextMenuItem } from "#modules/episodes/SettingsButton/CopyLinkContextMenuItem";
import { PropsOf, SetState } from "#modules/utils/react";
import { DurationView, WeightView } from "#modules/history";
import { useUser } from "#modules/core/auth/useUser";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { SeriesIcon } from "../../SeriesIcon/SeriesIcon";
import styles from "./ListItem.module.css";

type Props = {
  episode: EpisodeEntity;
  series: SeriesEntity;
  setEpisode: SetState<EpisodeEntity>;
  onDelete: ()=> void;
};

export const EpisodeListItem = ( { episode, series, setEpisode, onDelete }: Props) => {
  const { openMenu } = useContextMenuTrigger();
  const coverId = episode.imageCoverId ?? series.imageCoverId;
  const { data: imageCover } = useImageCover(coverId);
  const user = useUser();
  const hasUser = !!user;
  let subtitleSeen: PropsOf<typeof ResourceSubtitle>["items"][0];

  assertIsDefined(episode.fileInfos);

  if (hasUser) {
    assertIsDefined(episode.userInfo);

    subtitleSeen = {
      text: episode.userInfo.lastTimePlayed === 0
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
                <LocalDataProvider data={episode} setData={(newVal) => {
                  if (typeof newVal === "function")
                    setEpisode(prev => newVal(prev));
                  else
                    setEpisode(newVal);
                }}>
                  <EditEpisodeContextMenuItem
                    initialData={episode}
                    setData={setEpisode as any}
                  />
                  <CopyEpisodeLinkContextMenuItem />
                  <EpisodeLatestViewsContextMenuItem
                    episode={episode}
                    episodeCompKey={episode.compKey}
                  />
                  <DeleteEpisodeContextMenuItem
                    onActionSuccess={onDelete}
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
