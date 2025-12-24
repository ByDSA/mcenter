import type { PlaylistEntity } from "#modules/musics/playlists/Playlist/types";
import type { MusicEntity } from "$shared/models/musics";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RefObject } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { secsToMmss } from "#modules/utils/dates";
import { backendUrl } from "#modules/requests";

export type PlayerStatus = "paused" | "playing" | "stopped";

export enum RepeatMode {
  Off = 0, All = 1, One = 2
}

export type PlayerResource = {
  type: "episode" | "music";
  resourceId: string;
  music: MusicEntity;
  playlist: {
    id: string | null;
    itemId: string | null;
  };
  slug: string;
  ui: {
    title: string;
    artist: string;
    album?: string;
    length: string;
    coverImg?: string;
  };
};

type PlayProps = {
  resource: PlayerResource;
};

type PlayPlaylistItemProps = {
  playlist: PlaylistEntity;
  index: number;
  ownerSlug?: string;
};

type PlayMusicProps = {
  addToEnd?: boolean;
  keepQuery?: boolean;
};

// --- Helpers ---
function musicToResource(music: MusicEntity): PlayerResource {
  const duration = music.fileInfos?.[0].mediaInfo.duration;

  return {
    type: "music",
    resourceId: music.id,
    slug: music.slug,
    music,
    playlist: {
      id: null,
      itemId: null,
    },
    ui: {
      title: music.title,
      artist: music.artist,
      album: music.album,
      length: duration ? secsToMmss(duration) : "00:00",
      coverImg: music.coverUrl,
    },
  };
}

export function playlistToQueue(playlist: PlaylistEntity): PlayerResource[] {
  return playlist.list.map(item => ( {
    ...musicToResource(item.music),
    playlist: {
      itemId: item.id,
      id: playlist.id,
    },
  } ));
}

type SetCurrentTimeProps = {
  audioRef?: RefObject<HTMLAudioElement | null>;
};

// --- Interface del Store ---
interface PlayerState {
  status: PlayerStatus;
  currentResource: PlayerResource | null;
  queue: PlayerResource[];
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
  playMusic: (music: MusicEntity, props?: PlayMusicProps)=> void;
  playPlaylistItem: (props: PlayPlaylistItemProps)=> void;
  playQueueIndex: (index: number, props?: SetCurrentTimeProps)=> void;
  playQuery: (q: string)=> Promise<void>;
  pause: ()=> void;
  resume: ()=> void;
  stop: ()=> void;
  addToQueue: (resource: PlayerResource)=> void;
  next: ()=> Promise<void>;
  prev: ()=> Promise<void>;
  setStatus: (newVale: PlayerStatus)=> void;
  setDuration: (newValue: number | undefined)=> void;
  setQueue: (resources: PlayerResource[])=> void;
  setQueueIndex: (index: number)=> void;
  cycleRepeatMode: ()=> void;
  setIsShuffle: (isShuffle: boolean)=> void;
  setCurrentTime: (newTime: number, props?: SetCurrentTimeProps)=> void;

  // Getters (Computados)
  hasPrev: ()=> boolean;
  hasNext: ()=> boolean;
  setVolume: (newValue: number)=> void;
  setCompressionValue: (newValue: number)=> void;
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

      playMusic: (music, props) => {
        const resource = musicToResource(music);
        const { currentResource } = get();
        const isSameAsLatest = currentResource
        && currentResource.resourceId === music.id;

        set( {
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: music.fileInfos?.[0]?.mediaInfo.duration ?? undefined,
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

      playPlaylistItem: (props) => {
        const { index, playlist, ownerSlug } = props;
        const { list } = playlist;

        if (index >= list.length)
          return;

        const currentItem = list[index];
        const resource = {
          ...musicToResource(currentItem.music),
          playlist: {
            itemId: currentItem.id,
            id: playlist.id,
          },
        };
        const { currentResource, queue } = get();
        const isSameAsLatest = currentResource
        && currentResource.resourceId === queue[index].resourceId;

        set( {
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: currentItem.music.fileInfos?.[0]?.mediaInfo.duration ?? undefined,
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

        const currentResource = musicToResource(music);
        const isSameAsLatest = currentResource
        && currentResource.resourceId === music.id;

        set( {
          query: q,
          currentTime: 0,
          ...(isSameAsLatest
            ? {}
            : {
              duration: music.fileInfos?.[0]?.mediaInfo.duration ?? undefined,
            } ),
          currentResource,
          queue: [currentResource],
          status: "playing",
          queueIndex: 0,
        } );
      },
      playQueueIndex: (index, props) => {
        const { queue, currentResource, setCurrentTime } = get();

        if (index < 0 || index >= queue.length)
          return;

        const { music } = queue[index];
        const isSameAsLatest = currentResource
        && currentResource.resourceId === queue[index].resourceId;

        setCurrentTime(0, {
          audioRef: props?.audioRef,
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

      next: async () => {
        const { queueIndex, queue, repeatMode, isShuffle, currentResource, query } = get();
        const playOfflineRandom = () => {
          const normalRandomIndex = getRandomExcludePrevious(queue.length - 1, queueIndex);

          if (normalRandomIndex === -1) {
            get().stop();

            return;
          }

          get().playQueueIndex(normalRandomIndex);
        };
        const playingType = (() => {
          if (currentResource?.playlist.id)
            return "playlist";

          if (query)
            return "query";

          return "one";
        } )();

        if ((!isShuffle && (playingType === "playlist" || playingType === "one"))
          || (playingType === "query" && queueIndex < queue.length - 1)) {
          let newIndex = queueIndex + 1;

          if (newIndex >= queue.length) {
            if (repeatMode === RepeatMode.All)
              newIndex = 0;
            else
              return;
          }

          get().playQueueIndex(newIndex);

          return;
        }

        // query / playlist con shuffle
        if (playingType === "query" || playingType === "playlist") {
          const music = await fetchQueryMusic(query!);

          try {
            if (!music)
              throw new Error("Not found");

            if (currentResource?.playlist.id) {
              const index = queue.findIndex(item=>item.music.id === music.id);

              if (index === -1)
                throw new Error("Not found");

              get().playQueueIndex(index);
            } else {
              get().playMusic(music, {
                addToEnd: true,
                keepQuery: true,
              } );
            }
          } catch {
            playOfflineRandom();
          }

          return;
        }

        // one con shuffle
        playOfflineRandom();
      },

      // eslint-disable-next-line require-await
      prev: async () => {
        const { queueIndex, queue, repeatMode } = get();
        let newIndex = queueIndex - 1;

        if (newIndex < 0) {
          if (repeatMode === RepeatMode.All)
            newIndex = queue.length - 1;
          else
            return;
        }

        get().playQueueIndex(newIndex);
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
        if (props?.audioRef?.current)
          props.audioRef.current.currentTime = newValue;

        return set( {
          currentTime: newValue,
        } );
      },

      // Helpers computados
      hasPrev: () => {
        const { queueIndex, repeatMode } = get();

        return queueIndex > 0 || repeatMode === RepeatMode.All;
      },
      hasNext: () => {
        const { queueIndex, queue, repeatMode, isShuffle, query } = get();

        return queueIndex + 1 < queue.length || repeatMode === RepeatMode.All
         || (isShuffle && queue.length > 1) || !!query;
      },
    } ),
    {
      name: "browser-player",
      partialize: (state: PlayerState) => ( {
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        volume: state.volume,
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

    return json.data as MusicEntity;
  } catch {
    return null;
  }
}
