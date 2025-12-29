import { MusicEntity } from "$shared/models/musics";
import { Album, Person } from "@mui/icons-material";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { useUser } from "#modules/core/auth/useUser";
import { formatDate } from "#modules/utils/dates";
import { PlaylistFavButton } from "#modules/musics/playlists/PlaylistFavButton";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { DurationView, MetadataView } from "#modules/history";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import styles from "./Music.module.css";
import { PlayMusicButton } from "./PlayMusicButton";
import { genContextMenuContent } from "./ContextMenu";

type Props = {
  value: MusicEntity;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Music = ( { value }: Props) => {
  const { id, title, album, coverUrl, artist, disabled,
    year, createdAt, updatedAt, addedAt,
    slug, tags,
    isFav,
    userInfo,
    fileInfos,
    ...rest } = value;
  const { user } = useUser();
  const { openMenu } = useContextMenuTrigger();
  const durationSecs = fileInfos?.[0].mediaInfo.duration;

  return (
    <section className={styles.card}>
      <header className={styles.mainHeader}>
        <main>
          <div className={styles.coverContainer}>
            <MusicImageCover img={{
              url: coverUrl,
            }} />
          </div>

          <div className={styles.info}>
            <article>
              <p className={styles.title}>{title}</p>
            </article>
            <article>
              <MetadataView
                className={styles.subtitle}
                icon={<Person />}
                title="Artista"
                txt={artist}
              />
              {album && <MetadataView
                className={styles.subtitle}
                icon={<Album />}
                title="Álbum"
                txt={album}
              />}
              {durationSecs !== undefined && durationSecs !== null
               && <DurationView
                 className={styles.subtitle}
                 duration={durationSecs}
               />}
              {year && <p className={styles.subtitle}>
              Año: {year}
              </p>}
            </article>
          </div>
        </main>
        <footer>
          <PlayMusicButton music={value} disabled={disabled}/>

          <SettingsButton onClick={(e)=> {
            openMenu( {
              event: e,
              content: genContextMenuContent( {
                music: value,
                user,
              } ),
            } );
          }}/>

          {user && <PlaylistFavButton
            initialValue={isFav}
            musicId={value.id}
            favoritesPlaylistId={user.musics.favoritesPlaylistId}
          />}
        </footer>
      </header>
      <main className={styles.metadata}>
        <div className={styles.metadataItem}>
          <span>id</span>
          <span>{id}</span>
        </div>
        <div className={styles.metadataItem}>
          <span>Slug</span>
          <span>{slug}</span>
        </div>
        {tags && <div className={styles.metadataItem}>
          <span>Tags</span>
          <span>{tags.join(", ")}</span>
        </div>}
        <hr className={styles.hr}/>
        {userInfo && <>
          <p className={styles.metadataSectionTitle}>User Info</p>
          <div className={styles.metadataItem}>
            <span>Weight</span>
            <span>{userInfo.weight}</span>
          </div>
          <div className={styles.metadataItem}>
            <span>Tags</span>
            <span>{userInfo.tags?.join(", ")}</span>
          </div>
          <hr className={styles.hr}/>
        </>}
        <p className={styles.metadataSectionTitle}>Tiempos</p>
        <div className={styles.metadataItem}>
          <span>Creado</span><span>{formatDate(createdAt, {
            dateTime: "datetime",
            ago: "no",
          } )}</span></div>
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
        <hr className={styles.hr}/>
        {Object.keys(rest).length > 0 && (

          Object.entries(rest).map(([key, v]) => (
            <div key={key} className={styles.metadataItem}>
              <span>{key}</span>
              <span>{String(v)}</span>
            </div>
          ))
        )}
      </main>
    </section>
  );
};
