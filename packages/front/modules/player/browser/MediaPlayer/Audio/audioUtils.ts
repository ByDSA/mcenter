import { PATH_ROUTES } from "$shared/routing";
import { showError } from "$shared/utils/errors/showError";
import { useEffect, useState } from "react";
import { useMusic } from "#musics/hooks";
import { backendUrl } from "#modules/requests";

const getUrl = async (musicId: string | null) => {
  if (!musicId)
    return null;

  const music = await useMusic.get(musicId);

  if (!music)
    return null;

  const base = backendUrl(PATH_ROUTES.musics.slug.withParams(music.slug));
  const u = new URL(base);

  u.searchParams.set("format", "raw");

  return u;
};

export const getUrlSkipHistory = async (musicId: string | null) => {
  const url = await getUrl(musicId);

  if (!url)
    return "";

  const u = new URL(url.href);

  u.searchParams.set("skip-history", "1");

  return u.href;
};

export async function fetchAddToHistory(musicId: string) {
  const url = await getUrl(musicId);

  if (url) {
    await fetch(url.href, {
      credentials: "include",
      cache: "no-store",
      headers: {
        Range: "bytes=0-0",
      },
    } );
  }
}

export async function ignoreAbortError(fn: ()=> Promise<void>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Error && e.name !== "AbortError")
      throw e;
  }
}

export function useMediaSession(
  engine: HTMLAudioElement | null,
  player: any,
) {
  const { data: music } = useMusic(player.currentResource?.resourceId ?? null);

  useEffect(() => {
    if (!navigator.mediaSession || !music || !engine)
      return;

    navigator.mediaSession.metadata = new MediaMetadata( {
      title: music.title,
      artist: music.artist,
      album: music.album,
      artwork: music.coverUrl
        ? [{
          src: music.coverUrl,
          sizes: "512x512",
          type: "image/jpeg",
        }]
        : undefined,
    } );

    const actionHandlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => player.resume()],
      ["pause", () => player.pause()],
      ["stop", () => player.stop()],
      ["previoustrack", () => player.hasPrev() && player.prev()],
      ["nexttrack", () => player.hasNext() && player.next()],
      ["seekbackward", () => engine.currentTime = Math.max(engine.currentTime - 10, 0)],
      [
        "seekforward",
        () => engine.currentTime = Math.min(engine.currentTime + 10, engine.duration),
      ],
      ["seekto", (d) => {
        if (d.seekTime)
          engine.currentTime = d.seekTime;
      }],
    ];

    actionHandlers.forEach(([act, h]) => {
      try {
        navigator.mediaSession.setActionHandler(act, h);
      } catch (e) {
        showError(e);
      }
    } );
  }, [music, engine, player]);

  // Sincronizar estado visual del OS
  useEffect(() => {
    if (!navigator.mediaSession)
      return;

    navigator.mediaSession.playbackState = player.status === "playing" ? "playing" : "paused";
  }, [player.status]);
}

// --- UTILIDADES ---
export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined")
      setIsOnline(navigator.onLine);

    const setOn = () => setIsOnline(true);
    const setOff = () => setIsOnline(false);

    window.addEventListener("online", setOn);
    window.addEventListener("offline", setOff);

    return () => {
      window.removeEventListener("online", setOn);
      window.removeEventListener("offline", setOff);
    };
  }, []);

  return isOnline;
}
