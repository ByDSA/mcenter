import { useState } from "react";
import { PlayArrow,
  Pause,
  MusicNote,
  AccessTime,
  CalendarToday } from "@mui/icons-material";
import { PATH_ROUTES } from "$shared/routing";
import { DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors } from "@dnd-kit/core";
import { arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis,
  restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { assertIsDefined } from "$shared/utils/validation";
import { useUser } from "#modules/core/auth/useUser";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { MusicEntityWithFileInfos } from "../models";
import { ContextMenuItem, useContextMenuTrigger } from "../../ui-kit/ContextMenu/ContextMenu";
import { CopyMusicMenuItem } from "../musics/MusicEntry/MusicEntry";
import { EditMusicContextMenuItem } from "../musics/EditMusic/ContextMenu";
import { MusicPlaylistItem } from "./PlaylistItem";
import { MusicPlaylistEntity } from "./models";
import { formatDurationHeader, playlistCopySlugUrl } from "./utils";
import styles from "./Playlist.module.css";
import commonStyles from "./common.module.css";
import { SettingsButton } from "./SettingsButton";
import { MusicPlaylistsApi } from "./requests";
import { RenamePlaylistContextMenuItem } from "./list/renameMenuItem";
import { DeletePlaylistContextMenuItem } from "./list/deleteItem";
import { AddToPlaylistContextMenuItem } from "./AddToPlaylistContextMenuItem";
import { PlaylistCover } from "./PlaylistCover";

export type PlaylistItemEntity = MusicPlaylistEntity["list"][0]
& {
    music: MusicEntityWithFileInfos;
  };

export type PlaylistEntity = Omit<MusicPlaylistEntity, "list"> & {
  list: PlaylistItemEntity[];
  coverUrl?: string;
};

interface PlaylistProps {
  value: PlaylistEntity;
  setValue: (newValue: PlaylistEntity)=> void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylist = ( { value, setValue }: PlaylistProps) => {
  const api = FetchApi.get(MusicPlaylistsApi);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState(false);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [pendingMotions, setPendingMotions] = useState<{oldIndex: number;
newIndex: number;}[]>([]);
  const totalDuration = value.list?.reduce(
    (acc, e) => acc
    + (e.music.fileInfos[0].mediaInfo.duration ?? 0),
    0,
  ) ?? 0;
  const totalSongs = value.list?.length || 0;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Mínimo 8px de movimiento para activar drag
      },
    } ),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    } ),
  );
  const handlePlayMusic = (item: PlaylistItemEntity) => {
    setCurrentPlaying(item.id);
    setIsPlaylistPlaying(true);
  };
  const handlePauseMusic = () => {
    setIsPlaylistPlaying(false);
  };
  const handlePlayPlaylist = () => {
    if (value.list.length > 0) {
      if (isPlaylistPlaying)
        setIsPlaylistPlaying(false);
      else {
        setCurrentPlaying(value.list[0].id);
        setIsPlaylistPlaying(true);
      }
    }
  };
  const handleMoreOptions = (e: React.MouseEvent<HTMLElement>) => {
    playlistOpenMenu( {
      event: e,
      content: (
        <>
          {user?.id === value.ownerUserId && <RenamePlaylistContextMenuItem
            className={styles.contextMenuItem}
            onSuccess={( { previous, current } ) => {
              if (previous.slug !== current.slug) {
                const userSlug = current.ownerUserPublic?.slug;

                assertIsDefined(userSlug);

                router.push(PATH_ROUTES.musics.frontend.playlists.slug.withParams( {
                  playlistSlug: current.slug,
                  userSlug,
                } ));
              }
            }}
            value={value}
            setValue={(v: PlaylistEntity) => {
              setValue( {
                ...value,
                name: v.name,
                slug: v.slug,
              } );
            }}
          />
          }
          <ContextMenuItem
            label="Copiar enlace"
            className={styles.contextMenuItem}
            onClick={async ()=> {
              const userSlug = value.ownerUserPublic?.slug;

              assertIsDefined(userSlug);

              await playlistCopySlugUrl( {
                userSlug,
                playlistSlug: value.slug,
                token: user?.id,
              } );
            }}
          />
          {user?.id === value.ownerUserId
          && <DeletePlaylistContextMenuItem
            value={value}
            onOpen={() => { playlistCloseMenu(); }}
            onActionSuccess={()=>router.push(PATH_ROUTES.musics.frontend.playlists.path)}
            getValue={()=>value}
          />
          }
        </>
      ),
    } );
  };
  const handleDragStart = () => {
    setIsDraggingGlobal(true);
  };
  const handleDragEnd = async (event: any) => {
    setIsDraggingGlobal(false);
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = value.list.findIndex((e) => e.id === active.id);
      const newIndex = value.list.findIndex((e) => e.id === over.id);
      const newArray = arrayMove(value.list, oldIndex, newIndex);

      setValue( {
        ...value,
        list: newArray,
      } );

      const motionsToDo = [
        ...pendingMotions,
        {
          oldIndex,
          newIndex,
        },
      ];
      let last: MusicPlaylistEntity | null = null;

      try {
        while (motionsToDo.length > 0) {
          const res = await api.moveOneTrack(
            value.id,
            value.list[motionsToDo[0].oldIndex].id,
            motionsToDo[0].newIndex,
          );

          last = res.data;

          motionsToDo.splice(0, 1);
        }
      } catch {
        setPendingMotions(motionsToDo);
      }

      if (motionsToDo.length === 0 && last) {
        const res = await api.getManyByCriteria( {
          filter: {
            id: value.id,
          },
          expand: ["musics"],
        } );

        setValue(res.data[0] as PlaylistEntity);
      }
    }
  };
  const router = useRouter();
  const { openMenu: playlistOpenMenu,
    closeMenu: playlistCloseMenu } = useContextMenuTrigger();
  const { user } = useUser();
  const { openMenu: playlistItemOpenMenu,
    closeMenu: playlistItemCloseMenu } = useContextMenuTrigger();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const SortablePlaylistItem = ( { item, index }: { item: PlaylistItemEntity;
index: number; } ) => {
    const { id } = item;
    const { attributes,
      listeners,
      setNodeRef,
      transform,
      transition } = useSortable( {
      id,
    } );
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}>
        <MusicPlaylistItem
          value={item}
          index={index}
          isPlaying={currentPlaying === item.id && isPlaylistPlaying}
          isDragging={isDraggingGlobal}
          className={styles.playlistItem}
          onClickMenu={ (e) => playlistItemOpenMenu( {
            event: e,
            content: <>
              {user && <AddToPlaylistContextMenuItem
                musicId={item.musicId}
                user={user}
              />}
              <CopyMusicMenuItem
                music={item.music}
                token={user?.id}
              />
              {user && <EditMusicContextMenuItem initialData={item.music}/>}
              {user?.id === value.ownerUserId && <ContextMenuItem
                label="Eliminar"
                theme="danger"
                onClick={async () => {
                  await api.removeOneTrack(value.id, item.id);
                  const updatedList = value.list.filter((i) => i.id !== item.id);

                  setValue( {
                    ...value,
                    list: updatedList,
                  } );
                  playlistItemCloseMenu();
                }}
              />
              }
            </>,
          } )}
          onPlay={handlePlayMusic}
          onPause={handlePauseMusic}
        />
      </div>
    );
  };

  return (
    <div className={styles.playlistContainer}>
      <div className={styles.playlistHeader}>
        <div className={styles.headerContent}>
          <PlaylistCover
            alt={value.name}
            coverUrl={value.coverUrl}
            className={styles.playlistCover}/>

          <div className={styles.playlistInfo}>
            <span className={styles.playlistTitle}>

              <h1>{value.name}</h1>
            </span>

            <div className={styles.playlistStats}>
              <div className={styles.statItem}>
                <span>{totalSongs} canciones</span>
              </div>
              <span className={commonStyles.separator}>•</span>
              <div className={styles.statItem}>
                <span>{formatDurationHeader(totalDuration)}</span>
              </div>
              <span className={styles.hideLt500}>
                <span className={commonStyles.separator}>•</span>
                <div className={classes(styles.statItem, styles.createdAt)}
                  title="Fecha de creación">
                  <CalendarToday />
                  <span>{formatDateDDMMYYY(value.createdAt)}</span>
                </div>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.playlistControls}>
          <button
            className={styles.playAllButton}
            onClick={handlePlayPlaylist}
            disabled={totalSongs === 0}
          >
            {isPlaylistPlaying ? <Pause /> : <PlayArrow />}
          </button>
          <SettingsButton
            theme="dark"
            onClick={handleMoreOptions}
          />
        </div>
      </div>

      <div className={styles.playlistContent}>
        <div className={styles.tracksHeader}>
          <div className={styles.headerIndex}>#</div>
          <div className={styles.headerTitle}>CANCIÓN</div>
          <div className={styles.headerDuration} title="Duración">
            <AccessTime />
          </div>
          <div className={styles.headerActions}></div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={value.list?.map(item => item.id) ?? []}
            strategy={verticalListSortingStrategy}
          >
            <div className={classes(styles.tracksList, isDraggingGlobal && styles.isDragging)}>
              {value.list.length > 0
                ? (
                  <>
                    {
                      value.list.map((item, index) => (
                        <SortablePlaylistItem
                          key={item.id}
                          item={item}
                          index={index}
                        />
                      ))
                    }
                  </>
                )
                : (
                  <div className={styles.emptyState}>
                    <MusicNote className={styles.emptyStateIcon} />
                    <p className={styles.emptyStateText}>No hay canciones en esta playlist</p>
                  </div>
                )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
