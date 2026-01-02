import type { MusicEntity } from "$shared/models/musics";
import assert from "assert";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PATH_ROUTES } from "$shared/routing";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { backendUrl } from "#modules/requests";
import { withRetries } from "#modules/utils/retries";
import { useMusic } from "#modules/musics/hooks";
import { useAudioCache } from "./Audio/AudioCacheContext";

export type PlayerStatus = "paused" | "playing" | "stopped";

export enum RepeatMode {
  Off = 0, All = 1, One = 2
}

type PlayerResourceId = {
  type: "episode" | "music";
  resourceId: string;
};

type PlayProps = {
  resource: PlaylistQueueItem;
};

type PlayPlaylistItemProps = {
  playlist: MusicPlaylistEntity;
  index: number;
  ownerSlug?: string;
};

type PlayMusicProps = {
  addToEnd?: boolean;
  keepQuery?: boolean;
};

// --- Helpers ---
function musicToResource(music: MusicEntity): PlaylistQueueItem {
  return {
    type: "music",
    resourceId: music.id,
    itemId: null,
    playlistId: null,
  };
}

export function playlistToQueue(playlist: MusicPlaylistEntity): PlaylistQueueItem[] {
  return playlist.list.map(item => ( {
    itemId: item.id,
    playlistId: playlist.id,
    resourceId: item.musicId,
    type: "music",
  } ));
}

export type PlaylistQueueItem = PlayerResourceId & {
  itemId: string | null;
  playlistId: string | null;
};

type SetCurrentTimeProps = {
  audioElement?: HTMLAudioElement | null;
};

export type NextAction = {
  type: "INDEX";
  payload: number;
} | {
  type: "NEW_MUSIC";
  payload: MusicEntity;
};

type NextResource = {
  nextAction: NextAction | null;
  date: number;
};

// --- Interface del Store ---
interface PlayerState {
  status: PlayerStatus;
  currentResource: PlaylistQueueItem | null;
  nextResource: NextResource | null;
  queue: PlaylistQueueItem[];
  queueIndex: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  volume: number;
  currentTime: number; // seconds
  duration?: number; // seconds
  query?: string;
  compressionValue: number; // 0 = nada, 1 = máximo

  // Acciones
  setNextResource: (newValue: NextResource)=> void;
  play: (props: PlayProps)=> void;
  playMusic: (musicId: MusicEntity["id"], props?: PlayMusicProps)=> Promise<void>;
  playPlaylistItem: (props: PlayPlaylistItemProps)=> Promise<void>;
  playQueueIndex: (index: number, props?: SetCurrentTimeProps)=> Promise<void>;
  playQuery: (q: string)=> Promise<void>;
  pause: ()=> void;
  resume: ()=> void;
  stop: ()=> void;
  addToQueue: (resource: PlaylistQueueItem)=> void;
  getNext: ()=> Promise<NextAction | null>;
  next: ()=> Promise<void>;
  prev: ()=> Promise<void>;
  setStatus: (newVale: PlayerStatus)=> void;
  setDuration: (newValue: number | undefined)=> void;
  setQueue: (resources: PlaylistQueueItem[])=> void;
  setQueueIndex: (index: number)=> void;
  cycleRepeatMode: ()=> void;
  setIsShuffle: (isShuffle: boolean)=> void;
  setCurrentTime: (newTime: number, props?: SetCurrentTimeProps)=> void;

  // Getters (Computados)
  hasPrev: ()=> boolean;
  hasNext: ()=> boolean;
  setVolume: (newValue: number)=> void;
  setCompressionValue: (newValue: number)=> void;
  getPlayingType: ()=> "one" | "playlist" | "query";
}

export const useBrowserPlayer = create<PlayerState>()(
  persist(
    (set, get) => ( {
      status: "stopped",
      currentResource: null,
      nextResource: null,
      queue: [],
      queueIndex: -1,
      repeatMode: RepeatMode.Off,
      isShuffle: false,
      volume: 1,
      currentTime: 0,
      duration: undefined,
      query: undefined,
      isOpenFullscreen: false,
      compressionValue: 0,
      setCompressionValue: (newValue) => set( {
        compressionValue: newValue,
      } ),
      setDuration: (newValue) => set( {
        duration: newValue,
      } ),
      setStatus: (newValue) => set( {
        status: newValue,
      } ),
      play: ( { resource } ) => set( {
        currentResource: resource,
        status: "playing",
        nextResource: null,
      } ),

      playMusic: async (musicId, props) => {
        await useMusic.invalidateCache(musicId); // TODO
        const music = await useMusic.get(musicId);

        if (!music)
          return;

        const resource = musicToResource(music);
        const { currentResource } = get();
        const isSameAsLatest = currentResource
        && currentResource.resourceId === music.id;

        set( {
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: music.fileInfos![0]?.mediaInfo.duration ?? undefined,
            } ),
          currentResource: resource,
          nextResource: null,
          status: "playing",
          ...(props?.keepQuery
            ? {}
            : {
              query: undefined,
            } ),
          queue: props?.addToEnd ? [...get().queue, resource] : [resource],
          queueIndex: props?.addToEnd ? get().queue.length : 0,
        } );
      },

      playPlaylistItem: async (props) => {
        const { playlist, index, ownerSlug } = props;
        const currentItem = playlist.list[index];
        const resource: PlaylistQueueItem = {
          itemId: currentItem.id,
          playlistId: playlist.id,
          resourceId: currentItem.musicId,
          type: "music",
        };
        const { currentResource } = get();
        const isSameAsLatest = currentResource
        && currentResource.resourceId === resource.resourceId;

        set( {
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: (await useMusic.get(currentItem.musicId))
                ?.fileInfos?.[0]?.mediaInfo.duration
               ?? undefined,
            } ),
          currentResource: resource,
          status: "playing",
          queue: playlistToQueue(playlist),
          query: ownerSlug
            ? `playlist:@${ownerSlug}/${playlist.slug}`
            : `playlist:${playlist.slug}`,
          queueIndex: index,
        } );
      },
      playQuery: async (q: string) => {
        const music = await fetchQueryMusic(q);

        if (!music) {
          get().stop();

          return;
        }

        const { currentResource } = get();
        const isSameAsLatest = currentResource
        && currentResource.resourceId === music.id;
        const queueItem: PlaylistQueueItem = musicToResource(music);

        set( {
          query: q,
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: music.fileInfos?.[0]?.mediaInfo.duration ?? undefined,
            } ),
          currentResource: queueItem,
          queue: [queueItem],
          status: "playing",
          queueIndex: 0,
        } );
      },
      playQueueIndex: async (index, props) => {
        const { queue, currentResource, setCurrentTime } = get();

        if (index < 0 || index >= queue.length)
          return;

        const queueItem = queue[index];
        const isSameAsLatest = currentResource
        && currentResource.resourceId === queue[index].resourceId;
        const music = await useMusic.get(queueItem.resourceId);

        if (!music)
          return;

        setCurrentTime(0, {
          audioElement: props?.audioElement,
        } );
        set( {
          ...(isSameAsLatest
            ? {}
            : {
              duration: music.fileInfos?.[0]?.mediaInfo.duration ?? undefined,
            } ),
          currentResource: queue[index],
          status: "playing",
          queueIndex: index,
          nextResource: null,
        } );
      },
      pause: () => set( {
        status: "paused",
      } ),
      resume: () => {
        if (get().currentResource) {
          set( {
            status: "playing",
          } );
        }
      },
      stop: () => set( {
        currentTime: 0,
        status: "stopped",
        query: undefined,
        currentResource: null,
        nextResource: null,
        queue: [],
      } ),
      addToQueue: (resource) => set((state) => ( {
        queue: [...state.queue, resource],
        nextResource: null,
      } )),
      getPlayingType: () => {
        const { currentResource, query } = get();

        if (currentResource?.playlistId)
          return "playlist";

        if (query)
          return "query";

        return "one";
      },
      getNext: async () => {
        const { queueIndex, queue, repeatMode, isShuffle, query } = get();
        const playingType = get().getPlayingType();

        // 1. LÓGICA DE ORDEN SECUENCIAL
        if ((!isShuffle && (playingType === "playlist" || playingType === "one"))
      || (playingType === "query" && queueIndex < queue.length - 1)) {
          let newIndex = queueIndex + 1;

          if (newIndex >= queue.length) {
            if (repeatMode === RepeatMode.All) {
              return {
                type: "INDEX",
                payload: 0,
              };
            }

            return null; // No hay más canciones
          }

          return {
            type: "INDEX",
            payload: newIndex,
          };
        }

        // 2. LÓGICA DE SHUFFLE / DISCOVERY (CON API)
        if (playingType === "playlist" || playingType === "query") {
          try {
            assert(!!query);
            const music = await withRetries(() => fetchQueryMusic(query), {
              retries: 3,
            } );

            if (!music)
              throw new Error("No music found");

            if (playingType === "playlist") {
              const index = queue.findIndex(item => item.resourceId === music.id);

              // Si está en la cola, devolvemos el índice, si no, fallback a random offline
              return {
                type: "INDEX",
                payload: index !== -1 ? index : getOfflineRandomIndex(get),
              };
            }

            // Si es tipo query, devolvemos el objeto de música para agregarlo
            return {
              type: "NEW_MUSIC",
              payload: music,
            };
          } catch {
            return {
              type: "INDEX",
              payload: getOfflineRandomIndex(get),
            };
          }
        }

        // 3. CASO DEFAULT (One con shuffle o fallbacks)
        return {
          type: "INDEX",
          payload: getOfflineRandomIndex(get),
        };
      },

      /**
   * Ejecuta la acción de ir a la siguiente canción.
   */
      next: async () => {
        const { getNext, nextResource, queue } = get();
        const { has } = useAudioCache.getState();
        const isValidNextResourceAction = nextResource?.nextAction
        && has(
          nextResource.nextAction.type === "INDEX"
            ? queue[nextResource.nextAction.payload].resourceId
            : nextResource.nextAction.payload.id,
        );
        const nextAction = isValidNextResourceAction ? nextResource.nextAction : await getNext();

        if (!nextAction) {
          get().stop();

          return;
        }

        switch (nextAction.type) {
          case "INDEX":
            if (nextAction.payload === -1)
              get().stop();
            else
              await get().playQueueIndex(nextAction.payload);

            break;
          case "NEW_MUSIC":
            await get().playMusic(nextAction.payload.id, {
              addToEnd: true,
              keepQuery: true,
            } );
            break;
        }
      },
      prev: async () => {
        const { queueIndex, queue, repeatMode } = get();
        let newIndex = queueIndex - 1;

        if (newIndex < 0) {
          if (repeatMode === RepeatMode.All)
            newIndex = queue.length - 1;
          else
            return;
        }

        await get().playQueueIndex(newIndex);
      },
      setQueue: (queue) => set( {
        queue,
      } ),
      setQueueIndex: (queueIndex) => set( {
        queueIndex,
      } ),
      cycleRepeatMode: () => set((state) => {
        const nextMode = {
          [RepeatMode.Off]: RepeatMode.All,
          [RepeatMode.All]: RepeatMode.One,
          [RepeatMode.One]: RepeatMode.Off,
        }[state.repeatMode];

        return {
          repeatMode: nextMode,
        };
      } ),
      setIsShuffle: (isShuffle) => {
        return set( {
          isShuffle,
        } );
      },
      setVolume: (newValue) => {
        return set( {
          volume: newValue,
        } );
      },
      setCurrentTime: (newValue, props) => {
        if (props?.audioElement)
          props.audioElement.currentTime = newValue;

        return set( {
          currentTime: Math.min(newValue, get().duration ?? 0),
        } );
      },
      setNextResource: (newValue) => {
        return set( {
          nextResource: newValue,
        } );
      },

      // Helpers computados
      hasPrev: () => {
        const { queueIndex, repeatMode } = get();

        return queueIndex > 0 || repeatMode === RepeatMode.All;
      },
      hasNext: () => {
        const { queueIndex, queue, repeatMode, isShuffle, getPlayingType } = get();

        return queueIndex + 1 < queue.length || (repeatMode === RepeatMode.All && queue.length > 1)
         || (isShuffle && queue.length > 1) || getPlayingType() === "query";
      },
    } ),
    {
      name: "browser-player",
      partialize: (state: PlayerState) => ( {
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        volume: state.volume,
        compressionValue: state.compressionValue,
      } ),
    },
  ),
);

function getRandomExcludePrevious(max: number, previousValue?: number): number {
  // Caso especial: si el rango es 0 y ese es el valor previo, no hay opciones.
  if (max === 0 && previousValue === 0)
    return -1;

  let newValue: number;

  do
    newValue = Math.floor(Math.random() * (max + 1));
  while (newValue === previousValue);

  return newValue;
}

async function fetchQueryMusic(q: string) {
  try {
    const url = backendUrl(PATH_ROUTES.musics.pickRandom.withParams( {
      q,
    } ));
    const res = await fetch(url, {
      cache: "no-cache",
      credentials: "include",
    } );
    const json = await res.json();
    const data = json.data as MusicEntity;

    useMusic.updateCache(data.id, data);

    return data;
  } catch {
    return null;
  }
}

const getOfflineRandomIndex = (get) => {
  const { queue, queueIndex } = get();
  const normalRandomIndex = getRandomExcludePrevious(queue.length - 1, queueIndex);

  return normalRandomIndex;
};
