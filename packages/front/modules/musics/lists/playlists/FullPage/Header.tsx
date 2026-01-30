import { usePathname, useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/resources/FullPage/VisibilityTag";
import { useLocalData } from "#modules/utils/local-data-context";
import { DateTag } from "#modules/resources/FullPage/DateTag/DateTag";
import { HeaderList } from "#modules/resources/FullPage/HeaderList";
import { formatDurationHeader } from "../utils";
import { MusicPlaylistEntity } from "../models";
import { MusicPlaylistSettingsButton } from "../SettingsButton/Settings";

type Props = {
  totalSongs: number;
  totalDuration: number;
  playlistStatus: PlayerStatus;
  onPlay: ()=> void;
};

export const PlaylistHeader = ( { totalSongs,
  totalDuration,
  playlistStatus,
  onPlay }: Props) => {
  const { data } = useLocalData<MusicPlaylistEntity>();
  const pathname = usePathname();
  const router = useRouter();
  const infoItems = [
    <span key="count">
      {totalSongs} {totalSongs === 1 ? "música" : "músicas"}
    </span>,
    <span key="duration">{formatDurationHeader(totalDuration)}</span>,
    <VisibilityTag key="visibility" isPublic={data.visibility === "public"} />,
    <DateTag key="date" date={data.createdAt} />,
  ];

  return (
    <HeaderList
      title={data.name}
      cover={<MusicImageCover
        title={data.name}
        cover={data.imageCover}
      />}
      onPlay={onPlay}
      playStatus={playlistStatus}
      playDisabled={totalSongs === 0}
      settings={
        <MusicPlaylistSettingsButton
          onEdit={(current, previous) => {
            if (
              pathname.startsWith(PATH_ROUTES.musics.frontend.playlists.slug.path)
              && previous.slug !== current.slug
            ) {
              const userSlug = current.ownerUserPublic?.slug;

              assertIsDefined(userSlug);
              router.push(
                PATH_ROUTES.musics.frontend.playlists.slug.withParams( {
                  playlistSlug: current.slug,
                  userSlug,
                } ),
              );
            }
          }}
          onDelete={() => {
            router.push(PATH_ROUTES.musics.frontend.playlists.path);
          }}
        />
      }
      info={infoItems}
    />
  );
};
