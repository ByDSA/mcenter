/* eslint-disable import/no-cycle */
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

type PlayPlaylistProps = {
  playlist: MusicPlaylistEntity;
  index?: number;
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

type SetCurrentTimeProps = {
  shouldUpdateAudioElement?: boolean;
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
  isOnline: boolean;
  audioElement: HTMLAudioElement | null;

  // Setters
  setAudioElement: (newValue: HTMLAudioElement | null)=> void;

  // Acciones
  setNextResource: (newValue: NextResource | null)=> void;
  play: (props: PlayProps)=> void;
  playMusic: (musicId: MusicEntity["id"], props?: PlayMusicProps)=> Promise<void>;
  playPlaylist: (props: PlayPlaylistProps)=> Promise<void>;
  playQueueIndex: (index: number)=> Promise<void>;
  playQuery: (q: string)=> Promise<void>;
  pause: ()=> void;
  resume: ()=> void;
  stop: ()=> void;
  close: ()=> void;
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
  backward: (relativeTimeSecs: number)=> void;
  forward: (relativeTimeSecs: number)=> void;
  setIsOnline: (newValue: boolean)=> void;

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
      isOnline: false,
      audioElement: null,
      setAudioElement: (newValue) => set( {
        audioElement: newValue,
      } ),
      setIsOnline: (newValue)=> set( {
        isOnline: newValue,
      } ),
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
        let music = await useMusic.get(musicId);

        if (!music?.fileInfos) {
        // Para que fetchee fileinfos. (TODO: alguna forma más eficiente):
          await useMusic.invalidateCache(musicId);
          music = await useMusic.fetch(musicId, {
            expand: ["fileInfos"],
          } );
        }

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

      playPlaylist: async (props) => {
        const { playlist, index: propsIndex, ownerSlug } = props;
        const query = ownerSlug
          ? `playlist:@${ownerSlug}/${playlist.slug}`
          : `playlist:${playlist.slug}`;

        set( {
          queue: playlistToQueue(playlist),
          query,
          queueIndex: Infinity,
        } );
        const isShufle = get().isShuffle;
        let index = propsIndex;

        if (index === undefined) {
          if (!isShufle)
            index = 0;
          else {
            const nextAction = await get().getNext();

            if (!nextAction) {
              get().stop();

              return;
            }

            if (nextAction.type === "INDEX")
              index = nextAction.payload;
            else
              index = playlist.list.findIndex(e=>e.musicId === nextAction.payload.id);
          }
        }

        return get().playQueueIndex(index);
      },
      playQuery: async (q: string) => {
        let music: MusicEntity | null = null;

        try {
          music = await withRetries(() => fetchQueryMusic(q), {
            retries: 3,
          } );
        } catch { /* empty */ }

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
          nextResource: null,
          queue: [queueItem],
          status: "playing",
          queueIndex: 0,
        } );
      },
      playQueueIndex: async (index) => {
        const { queue, currentResource, setCurrentTime } = get();

        if (index < 0 || index >= queue.length)
          return;

        const queueItem = queue[index];
        const isSameAsLatest = currentResource
        && currentResource.resourceId === queue[index].resourceId;
        const music = await useMusic.get(queueItem.resourceId);

        if (!music)
          return;

        if (isSameAsLatest) {
          setCurrentTime(0, {
            shouldUpdateAudioElement: true,
          } );
        }

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
      close: () => {
        stop();
        set( {
          currentResource: null,
        } );
      },
      stop: () => {
        const { setCurrentTime } = get();

        setCurrentTime(0, {
          shouldUpdateAudioElement: true,
        } );
        set( {
          status: "stopped",
          query: undefined,
          nextResource: null,
          queue: [],
        } );
      },
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
        const { queueIndex, queue, repeatMode, isShuffle, query, getPlayingType } = get();
        const playingType = getPlayingType();

        return await getNextByParams( {
          queueIndex,
          queue,
          repeatMode,
          isShuffle,
          query,
          playingType,
        } );
      },
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
        const { duration, audioElement } = get();
        const finalValue = Math.min(newValue, duration ?? 0);

        if (props?.shouldUpdateAudioElement && audioElement)
          audioElement.currentTime = finalValue;

        return set( {
          currentTime: finalValue,
        } );
      },
      backward: (newRelativeTime)=> {
        const { currentTime, setCurrentTime } = useBrowserPlayer.getState();
        const newTime = Math.max(currentTime - newRelativeTime, 0);

        setCurrentTime(newTime, {
          shouldUpdateAudioElement: true,
        } );
      },
      forward: (newRelativeTime)=> {
        const { currentTime, setCurrentTime, duration } = useBrowserPlayer.getState();
        const newTime = Math.min(currentTime + newRelativeTime, duration ?? 0);

        setCurrentTime(newTime, {
          shouldUpdateAudioElement: true,
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
  const url = backendUrl(PATH_ROUTES.musics.pickRandom.withParams( {
    q,
  } ));
  const res = await fetch(url, {
    cache: "no-cache",
    credentials: "include",
  } );
  const json = await res.json();
  const data = json.data as MusicEntity | null;

  if (data === null)
    return null;

  // Para que tenga todos los campos (favorites, imageCover...) que no trae el pickRandom:
  await useMusic.fetch(data.id);

  return data;
}

const getOfflineRandomIndex = ( { queueLength, queueIndex }: {queueLength: number;
queueIndex: number;} ) => {
  const normalRandomIndex = getRandomExcludePrevious(queueLength - 1, queueIndex);

  return normalRandomIndex;
};

type GetNextProps = {
  queueIndex: number;
  queue: PlaylistQueueItem[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  query?: string;
  playingType: "one" | "playlist" | "query";
};
export async function getNextByParams(props: GetNextProps): Promise<NextAction | null> {
  const { queueIndex, queue, repeatMode, isShuffle, query, playingType } = props;

  // 1.async  LÓGICA DE ORDEN SECUENCIAL
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
    assert(!!query);
    const music = await withRetries(() => fetchQueryMusic(query), {
      retries: 3,
    } );

    if (!music)
      return null;

    if (playingType === "playlist") {
      const index = queue.findIndex(item => item.resourceId === music.id);

      // Si está en la cola, devolvemos el índice, si no, fallback a random offline
      return {
        type: "INDEX",
        payload: index !== -1
          ? index
          : getOfflineRandomIndex( {
            queueLength: queue.length,
            queueIndex,
          } ),
      };
    }

    // Si es tipo query, devolvemos el objeto de música para agregarlo
    return {
      type: "NEW_MUSIC",
      payload: music,
    };
  }

  // 3. CASO DEFAULT (One con shuffle o fallbacks)
  return {
    type: "INDEX",
    payload: getOfflineRandomIndex( {
      queueLength: queue.length,
      queueIndex,
    } ),
  };
}
