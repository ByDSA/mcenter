/* eslint-disable import/no-cycle */
import assert from "assert";
import { isMusicUnavailable, type MusicEntity } from "$shared/models/musics";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { getFirstAvailableFileInfoOrFirst } from "$shared/models/file-info-common/file-info";
import { withRetries } from "#modules/utils/retries";
import { useMusic } from "#modules/musics/hooks";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicsApi } from "#modules/musics/requests";
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
  const uuid = crypto.randomUUID();

  return {
    type: "music",
    resourceId: music.id,
    itemId: uuid,
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
  playSmartPlaylist: (q: string)=> Promise<void>;
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
  getPlayingType: ()=> "one" | "playlist" | "smart-playlist";
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

        if (!music)
          return;

        const fileInfo = getFirstAvailableFileInfoOrFirst(music.fileInfos);

        if (isMusicUnavailable(music, {
          precalcFileInfo: fileInfo,
        } ))
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
              duration: fileInfo?.mediaInfo.duration ?? undefined,
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

        if (playlist.list.length === 0) {
          logNoMusic();

          return;
        }

        const query = ownerSlug
          ? `playlist:@${ownerSlug}/${playlist.slug}`
          : `playlist:${playlist.slug}`;
        const queue = playlistToQueue(playlist);
        const { repeatMode, isShuffle } = get();

        set( {
          queue,
          query,
          queueIndex: Infinity,
        } );

        let index = propsIndex;

        if (index === undefined) {
          if (!isShuffle) {
            const firstAvailable = await getNextAvailableIndex(queue, -1, repeatMode);

            if (firstAvailable === null) {
              get().stop();

              return;
            }

            index = firstAvailable;
          } else {
            const nextAction = await get().getNext();

            if (!nextAction) {
              get().stop();

              return;
            }

            if (nextAction.type === "INDEX")
              index = nextAction.payload;
            else
              index = playlist.list.findIndex(e => e.musicId === nextAction.payload.id);
          }
        }

        return get().playQueueIndex(index);
      },
      playSmartPlaylist: async (q: string) => {
        let music: MusicEntity | null = null;

        try {
          const api = FetchApi.get(MusicsApi);

          music = await withRetries(async () => (await api.pickRandomByQuery(q)).data, {
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
        const fileInfo = getFirstAvailableFileInfoOrFirst(music.fileInfos);

        if (isMusicUnavailable(music, {
          precalcFileInfo: fileInfo,
        } ))
          return;

        set( {
          query: q,
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: fileInfo!.mediaInfo.duration ?? undefined,
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

        const fileInfo = getFirstAvailableFileInfoOrFirst(music.fileInfos);

        if (isMusicUnavailable(music, {
          precalcFileInfo: fileInfo,
        } ))
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
              duration: fileInfo!.mediaInfo.duration ?? undefined,
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
        get().stop();
        set( {
          currentResource: null,
          query: undefined,
          queue: [],
        } );
      },
      stop: () => {
        const { setCurrentTime } = get();

        setCurrentTime(0, {
          shouldUpdateAudioElement: true,
        } );
        set( {
          status: "stopped",
          nextResource: null,
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
          return "smart-playlist";

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
        const prevIndex = await getPrevAvailableIndex(queue, queueIndex, repeatMode);

        if (prevIndex === null)
          return;

        await get().playQueueIndex(prevIndex);
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
         || (isShuffle && queue.length > 1) || getPlayingType() === "smart-playlist";
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
  playingType: "one" | "playlist" | "smart-playlist";
};
export async function getNextByParams(props: GetNextProps): Promise<NextAction | null> {
  const { queueIndex, queue, repeatMode, isShuffle, query, playingType } = props;

  // 1.async  LÓGICA DE ORDEN SECUENCIAL
  if ((!isShuffle && (playingType === "playlist" || playingType === "one"))
      || (playingType === "smart-playlist" && queueIndex < queue.length - 1)) {
    const nextIndex = await getNextAvailableIndex(queue, queueIndex, repeatMode);

    if (nextIndex === null)
      return null;

    return {
      type: "INDEX",
      payload: nextIndex,
    };
  }

  // 2. LÓGICA DE SHUFFLE / DISCOVERY (CON API)
  if (playingType === "playlist" || playingType === "smart-playlist") {
    assert(!!query);
    const api = FetchApi.get(MusicsApi);
    const music = await withRetries(async () => (await api.pickRandomByQuery(query)).data, {
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

    // Si es tipo smart-playlist, devolvemos el objeto de música para agregarlo
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

function logNoMusic() {
  logger.error("No hay ninguna música para reproducir.");
}

export async function getNextAvailableIndex(
  queue: PlaylistQueueItem[],
  fromIndex: number, // exclusivo — pasa -1 para empezar desde el principio
  repeatMode: RepeatMode,
): Promise<number | null> {
  if (queue.length === 0)
    return null;

  let newIndex = fromIndex;
  let checked = 0;

  while (checked < queue.length) {
    newIndex++;
    checked++;

    if (newIndex >= queue.length) {
      if (repeatMode === RepeatMode.All)
        newIndex = 0;
      else
        return null;
    }

    const music = await useMusic.get(queue[newIndex].resourceId);

    if (music && !isMusicUnavailable(music))
      return newIndex;
  }

  return null; // todas las canciones no disponibles
}

export async function getPrevAvailableIndex(
  queue: PlaylistQueueItem[],
  fromIndex: number, // exclusivo — pasa queue.length para empezar desde el final
  repeatMode: RepeatMode,
): Promise<number | null> {
  if (queue.length === 0)
    return null;

  let newIndex = fromIndex;
  let checked = 0;

  while (checked < queue.length) {
    newIndex--;
    checked++;

    if (newIndex < 0) {
      if (repeatMode === RepeatMode.All)
        newIndex = queue.length - 1;
      else
        return null;
    }

    const music = await useMusic.get(queue[newIndex].resourceId);

    if (music && !isMusicUnavailable(music))
      return newIndex;
  }

  return null;
}
