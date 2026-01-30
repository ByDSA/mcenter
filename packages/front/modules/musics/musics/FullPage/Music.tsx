import { Album, Person } from "@mui/icons-material";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { useUser } from "#modules/core/auth/useUser";
import { formatDate } from "#modules/utils/dates";
import { PlaylistFavButton } from "#modules/musics/lists/playlists/PlaylistFavButton";
import { DurationView, MetadataView } from "#modules/history";
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
    disabled,
    year,
    createdAt,
    updatedAt,
    addedAt,
    slug,
    tags,
    isFav,
    userInfo,
    fileInfos,
    imageCover: _,
    ...rest } = value;
  const { user } = useUser();
  const durationSecs = fileInfos?.[0].mediaInfo.duration;
  const { data: imageCover } = useImageCover(value.imageCoverId ?? null);

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
            {year && <span>Año: {year}</span>}
          </>
        }
        controls={
          <>
            <PlayMusicButton music={value} disabled={disabled} />
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
        <div className={styles.metadataItem}>
          <span>id</span>
          <span>{id}</span>
        </div>
        <div className={styles.metadataItem}>
          <span>Slug</span>
          <span>{slug}</span>
        </div>
        {tags && (
          <div className={styles.metadataItem}>
            <span>Tags</span>
            <span>{tags.join(", ")}</span>
          </div>
        )}
        <hr className={styles.hr} />
        {userInfo && (
          <>
            <p className={styles.metadataSectionTitle}>User Info</p>
            <div className={styles.metadataItem}>
              <span>Weight</span>
              <span>{userInfo.weight}</span>
            </div>
            <div className={styles.metadataItem}>
              <span>Tags</span>
              <span>{userInfo.tags?.join(", ")}</span>
            </div>
            <hr className={styles.hr} />
          </>
        )}
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
