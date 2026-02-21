import { Album, CalendarToday, Person } from "@mui/icons-material";
import { assertIsDefined } from "$shared/utils/validation";
import { getFirstAvailableFileInfoOrFirst } from "$shared/models/file-info-common/file-info";
import { isMusicAvailable } from "$shared/models/musics";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { useUser } from "#modules/core/auth/useUser";
import { formatDate } from "#modules/utils/dates";
import { PlaylistFavButton } from "#modules/musics/lists/playlists/PlaylistFavButton";
import { DurationView, MetadataView, WeightView } from "#modules/history";
import { useImageCover } from "#modules/image-covers/hooks";
import { useMusic } from "#modules/musics/hooks";
import { HeaderItem } from "#modules/resources/FullPage/HeaderItem";
import { ResourceFullPage } from "#modules/resources/FullPage/FullPage/FullPage";
import { MusicSettingsButton } from "../SettingsButton/Button";
import styles from "./Music.module.css";
import { PlayMusicButton } from "./PlayMusicButton";

type Props = {
  musicId: string;
};

export const Music = ( { musicId }: Props) => {
  const value = useMusic.getCache(musicId);

  assertIsDefined(value);
  const { id,
    title,
    album,
    artist,
    disabled: _3,
    year,
    createdAt,
    updatedAt,
    addedAt,
    slug,
    releasedOn,
    tags,
    isFav,
    userInfo,
    fileInfos,
    imageCover: _1,
    imageCoverId: _2,
    ...rest } = value;
  const { user } = useUser();
  const fileInfo = getFirstAvailableFileInfoOrFirst(fileInfos);
  const durationSecs = fileInfo?.mediaInfo.duration;
  const { data: imageCover } = useImageCover(value.imageCoverId ?? null);
  const isDisabled = !isMusicAvailable(value, {
    precalcFileInfo: fileInfo,
  } );

  return (
    <ResourceFullPage>
      <HeaderItem
        title={title}
        cover={<MusicImageCover
          cover={imageCover}
        />}
        info={
          <>
            <MetadataView
              className={styles.subtitle}
              icon={<Person />}
              title="Artista"
              txt={artist}
            />
            {album && (
              <MetadataView
                className={styles.subtitle}
                icon={<Album />}
                title="Álbum"
                txt={album}
              />
            )}
            {durationSecs !== undefined && durationSecs !== null && (
              <DurationView
                className={styles.subtitle}
                duration={durationSecs}
              />
            )}
            {user && <WeightView
              weight={userInfo?.weight ?? 0} />}
            {releasedOn && <MetadataView
              className={styles.subtitle}
              icon={<CalendarToday />}
              title={"Fecha"}
              txt={releasedOn}
            />}
            {(!releasedOn && year) && <MetadataView
              className={styles.subtitle}
              icon={<CalendarToday />}
              title={"Año"}
              txt={(year!).toString()}
            />}
          </>
        }
        controls={
          <>
            <PlayMusicButton music={value} disabled={isDisabled} />
            <MusicSettingsButton musicId={value.id} />
            {user && (
              <PlaylistFavButton
                musicId={value.id}
                favoritesPlaylistId={user.musics.favoritesPlaylistId}
              />
            )}
          </>
        }
      />

      <main className={styles.metadata}>
        {tags && (
          <div className={styles.metadataItem}>
            <span>Tags</span>
            <span>{tags.join(", ")}</span>
          </div>
        )}
        {userInfo && (
          <div className={styles.metadataItem}>
            <span>User Tags</span>
            <span>{userInfo.tags?.join(", ")}</span>
          </div>
        )}
        <hr className={styles.hr} />
        <p className={styles.metadataSectionTitle}>Tiempos</p>
        <div className={styles.metadataItem}>
          <span>Creado</span>
          <span>{formatDate(createdAt, {
            dateTime: "datetime",
            ago: "no",
          } )}</span>
        </div>
        <div className={styles.metadataItem}>
          <span>Añadido</span>
          <span>{formatDate(addedAt, {
            dateTime: "datetime",
            ago: "no",
          } )}</span>
        </div>
        <div className={styles.metadataItem}>
          <span>Actualizado</span>
          <span>{formatDate(updatedAt, {
            dateTime: "datetime",
            ago: "no",
          } )}</span>
        </div>
        <hr className={styles.hr} />
        {Object.keys(rest).length > 0
          && Object.entries(rest).map(([key, v]) => (
            <div key={key} className={styles.metadataItem}>
              <span>{key}</span>
              <span>{String(v)}</span>
            </div>
          ))}
      </main>
    </ResourceFullPage>
  );
};
