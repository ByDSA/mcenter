import { assertIsDefined } from "$shared/utils/validation";
import { UserRoleName } from "$shared/models/auth";
import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { getFirstAvailableFileInfoOrFirst, isFileInfoUnavailable } from "$shared/models/file-info-common/file-info";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { SeriesIcon } from "#modules/episodes/series/SeriesIcon/SeriesIcon";
import { useImageCover } from "#modules/image-covers/hooks";
import { useUser } from "#modules/core/auth/useUser";
import { DurationView, WeightView } from "#modules/history";
import { useEpisode } from "#modules/episodes/hooks";
import { useSeries } from "#modules/episodes/series/hooks";
import { ResourceFullPage } from "#modules/resources/FullPage/FullPage/FullPage";
import { HeaderItem } from "#modules/resources/FullPage/HeaderItem";
import { DateTag } from "#modules/resources/FullPage/DateTag/DateTag";
import { ResourcePlayButtonView } from "#modules/resources/PlayButton/PlayButton";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { EditEpisodeContextMenuItem } from "#modules/episodes/Edit/ContextMenu";
import { EpisodeLatestViewsContextMenuItem } from "#modules/episodes/history/LatestViews/ContextMenuItem";
import { DeleteEpisodeContextMenuItem } from "#modules/episodes/Delete/ContextMenuItem";
import { ShareEpisodeLinkContextMenuItemCurrentCtx } from "#modules/episodes/SettingsButton/ShareContextMenuItem";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { DaAnchor } from "#modules/ui-kit/Anchor/Anchor";
import { LastSeenElement } from "../series/FullPage/Seasons/ListItem";
import styles from "./Episode.module.css";

// eslint-disable-next-line daproj/max-len
const LOREM_SYNOPSIS = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.";

type Props = {
  episodeId: string;
};

export const EpisodeFullPage = ( { episodeId }: Props) => {
  const { data: episode } = useEpisode(episodeId);
  const { data: series } = useSeries(episode?.seriesId ?? null);
  const coverId = episode?.imageCoverId ?? series?.imageCoverId;
  const { data: imageCover } = useImageCover(coverId ?? null);
  const { user } = useUser();
  const { openMenu } = useContextMenuTrigger();
  const router = useRouter();

  if (!episode || !series)
    return <ContentSpinner />;

  assertIsDefined(episode.fileInfos);

  const hasUser = !!user;
  const isAdmin = !!user?.roles.find(r => r.name === UserRoleName.ADMIN);
  const fileInfo = getFirstAvailableFileInfoOrFirst(episode.fileInfos);
  const duration = fileInfo
    ? Math.min(fileInfo.mediaInfo.duration ?? Infinity, fileInfo.end ?? Infinity)
      - Math.max(fileInfo.start ?? 0)
    : NaN;
  const isUnavailable = isFileInfoUnavailable(fileInfo);
  const seriesOnClick = () => {
    router.push(PATH_ROUTES.episodes.frontend.lists.withParams( {
      serieId: series.id,
    } ));
  };

  return (
    <ResourceFullPage>
      <HeaderItem
        title={<>{episode.title}<br/><ResourceSubtitle
          className={styles.seriesName}
          items={[
            {
              text: episode.episodeKey,
            }, {
              title: series.name,
              customContent: <DaAnchor
                theme="white"
                onClick={seriesOnClick}
              >{series.name}</DaAnchor>,
            },
          ]}
        /></>}
        cover={
          <MusicImageCover
            title={episode.title}
            cover={imageCover}
            icon={{
              element: <SeriesIcon />,
            }}
            size="medium"
          />
        }
        info={
          <>
            <DateTag date={episode.createdAt} />
            <DurationView duration={duration} />

            {hasUser && (<LastSeenElement
              userInfo={episode.userInfo}
              className={styles.lastSeen}
            />
            )}

            {episode.userInfo && (
              <WeightView weight={episode.userInfo.weight} />
            )}
          </>
        }
        controls={
          <>
            <ResourcePlayButtonView
              disabled={isUnavailable}
              status="stopped"
              onClick={undefined}
            />

            <SettingsButton
              theme="dark"
              onClick={(e) => {
                openMenu( {
                  event: e,
                  content: (
                    <LocalDataProvider data={episode}>
                      {isAdmin && (
                        <EditEpisodeContextMenuItem initialData={episode} />
                      )}
                      {hasUser && (
                        <EpisodeLatestViewsContextMenuItem episodeId={episodeId} />
                      )}
                      <ShareEpisodeLinkContextMenuItemCurrentCtx />
                      {isAdmin && (
                        <DeleteEpisodeContextMenuItem
                          onActionSuccess={
                            () => router.push(PATH_ROUTES.episodes.frontend.lists.path)
                          }
                        />
                      )}
                    </LocalDataProvider>
                  ),
                } );
              }}
            />
          </>
        }
      />

      <section className={styles.synopsis}>
        <p className={styles.synopsisTitle}>Sinopsis</p>
        <p className={styles.synopsisText}>{LOREM_SYNOPSIS}</p>
      </section>
    </ResourceFullPage>
  );
};
