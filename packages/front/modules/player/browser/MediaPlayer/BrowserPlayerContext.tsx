import type { MusicEntity } from "$shared/models/musics";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PATH_ROUTES } from "$shared/routing";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { backendUrl } from "#modules/requests";
import { withRetries } from "#modules/utils/retries";
import { useMusic } from "#modules/musics/hooks";

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

// --- Interface del Store ---
interface PlayerState {
  status: PlayerStatus;
  currentResource: PlaylistQueueItem | null;
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
  play: (props: PlayProps)=> void;
  playMusic: (musicId: MusicEntity["id"], props?: PlayMusicProps)=> Promise<void>;
  playPlaylistItem: (props: PlayPlaylistItemProps)=> Promise<void>;
  playQueueIndex: (index: number, props?: SetCurrentTimeProps)=> Promise<void>;
  playQuery: (q: string)=> Promise<void>;
  pause: ()=> void;
  resume: ()=> void;
  stop: ()=> void;
  addToQueue: (resource: PlaylistQueueItem)=> void;
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
        queue: [],
      } ),
      addToQueue: (resource) => set((state) => ( {
        queue: [...state.queue, resource],
      } )),
      getPlayingType: () => {
        const { currentResource, query } = get();

        if (currentResource?.playlistId)
          return "playlist";

        if (query)
          return "query";

        return "one";
      },
      next: async () => {
        const { queueIndex, queue, repeatMode, isShuffle, query } = get();
        const playOfflineRandom = async () => {
          const normalRandomIndex = getRandomExcludePrevious(queue.length - 1, queueIndex);

          if (normalRandomIndex === -1) {
            get().stop();

            return;
          }

          await get().playQueueIndex(normalRandomIndex);
        };
        const playingType = get().getPlayingType();

        // Siguiente en orden
        if ((!isShuffle && (playingType === "playlist" || playingType === "one"))
          || (playingType === "query" && queueIndex < queue.length - 1)) {
          let newIndex = queueIndex + 1;

          if (newIndex >= queue.length) {
            if (repeatMode === RepeatMode.All)
              newIndex = 0;
            else
              return;
          }

          await get().playQueueIndex(newIndex);

          return;
        }

        // playlist con shuffle
        if (playingType === "playlist") {
          try {
            const music = await withRetries(()=> fetchQueryMusic(query!), {
              retries: 3,
            } );

            if (!music)
              throw new Error("Error fetching query music");

            const index = queue.findIndex(item=>item.resourceId === music.id);

            if (index === -1)
              throw new Error("Index not found");

            await get().playQueueIndex(index);
          } catch {
            await playOfflineRandom();
          }

          return;
        } else if (playingType === "query") {
          const music = await withRetries(()=> fetchQueryMusic(query!), {
            retries: 3,
          } );

          if (!music)
            return;

          await get().playMusic(music.id, {
            addToEnd: true,
            keepQuery: true,
          } );

          return;
        }

        // one con shuffle
        await playOfflineRandom();
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
