import { showError } from "$shared/utils/errors/showError";
import { RefObject, useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { withRetries } from "#modules/utils/retries";
import { ErrorNoConnection } from "#modules/core/errors/custom-errors";
import { RepeatMode, useBrowserPlayer } from "../BrowserPlayerContext";
import { getUrlSkipHistory } from "./audioUtils";
import { handleExoticAudio } from "./exotic-audio";
import { useAudioEffects } from "./useAudioEffects";
import { useHistoryLogger } from "./useHistoryLogger";
import { usePrefetching } from "./usePrefetching";
import { useAudioCache } from "./AudioCacheContext";
import { useMediaSession } from "./useMediaSession";

export type AudioRef = RefObject<HTMLAudioElement | null>;

/**
 * AUDIO ENGINE
 * - Carrier (DOM): Mantiene la sesión viva con silencio.
 * - Engine (Memoria): Procesa el audio real a través del AudioContext.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AudioTag = () => {
  const player = useBrowserPlayer(useShallow((s) => ( {
    isOnline: s.isOnline,
    currentResource: s.currentResource,
    status: s.status,
    setCurrentTime: s.setCurrentTime,
    repeatMode: s.repeatMode,
    next: s.next,
    prev: s.prev,
    stop: s.stop,
    resume: s.resume,
    pause: s.pause,
    hasPrev: s.hasPrev,
    hasNext: s.hasNext,
  } )));
  const engineRef = useRef<HTMLAudioElement | null>(null);
  const syncingRef = useRef(false);
  const sync = useCallback(async () => {
    if (syncingRef.current)
      return;

    syncingRef.current = true;

    try {
      const engine = engineRef.current;

      // Evitar play si no hay fuente definida aún
      if (!engine || !engine.src || engine.src === "")
        return;

      await waitForPrefetching();

      const { status } = useBrowserPlayer.getState();

      if (status === "playing") {
        if (engine.paused || engine.error || engine.readyState === 0)
          await securePlayEngine();
      } else
        engine.pause();
    } finally {
      syncingRef.current = false;
    }
  }, []);
  const setGlobalAudioElement = useBrowserPlayer(s=>s.setAudioElement);

  useEffect(() => {
    if (engineRef.current || typeof Audio === "undefined")
      return;

    const audio = new Audio();

    audio.crossOrigin = "use-credentials";
    audio.preload = "auto";
    engineRef.current = audio;

    setGlobalAudioElement(engineRef.current);

    const onTimeUpdate = () => player.setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      const d = audio.duration;

      if (isFinite(d))
        useBrowserPlayer.getState().setDuration(d);
    };
    const onEnded = async () => {
      const { repeatMode } = useBrowserPlayer.getState();

      if (repeatMode === RepeatMode.One)
        audio.currentTime = 0;
      else if (player.hasNext())
        await player.next();
      else
        player.stop();

      await sync();
    };
    const onError = async (_e) => {
      await sync();
    };
    const checkBlobAndFix = async () => {
      if (!engineRef.current || !engineRef.current.src.startsWith("blob"))
        return;

      const { currentResource } = useBrowserPlayer.getState();

      if (!currentResource)
        return;

      try {
        const response = await fetch(audio.src, {
          cache: "no-store",
          headers: {
            Range: "bytes=0-0",
          },
        } );

        if (!response.ok)
          throw new Error("Blob muerto");
      } catch {
        const fallbackUrl = await getUrlSkipHistory(currentResource.resourceId);
        const saveTime = audio.currentTime;

        audio.src = fallbackUrl;
        audio.pause(); // Para que el tiempo que tarda en sync no se reproduzca
        audio.currentTime = saveTime;
        await sync();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", checkBlobAndFix);
    audio.addEventListener("seeking", checkBlobAndFix);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body)
        return;

      if (e.code === "Space") {
        e.preventDefault();
        const { status, pause, resume } = useBrowserPlayer.getState();

        status === "playing" ? pause() : resume();
      } else if (e.code === "ArrowLeft") {
        const { backward } = useBrowserPlayer.getState();

        backward(10);
      } else if (e.code === "ArrowRight") {
        const { forward } = useBrowserPlayer.getState();

        forward(10);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      engineRef.current = null;
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", checkBlobAndFix);
      audio.removeEventListener("seeking", checkBlobAndFix);
      window.removeEventListener("keydown", onKeyDown);
      setGlobalAudioElement(null);
    };
  }, [setGlobalAudioElement]);

  useEffect(() => {
    const loadResource = async () => {
      const engine = engineRef.current;

      if (!engine)
        return;

      engine.pause();

      if (!player.currentResource) {
        engine.pause();
        engine.removeAttribute("src");
        engine.load();
        await sync();

        return;
      }

      abortPrefetchingFetch();
      await waitForPrefetching(); // Por si está convirtiendo el audio
      const { get } = useAudioCache.getState();
      let newUrl = get(player.currentResource.resourceId);

      newUrl ??= await getUrlSkipHistory(player.currentResource.resourceId);

      if (engine.src !== newUrl) {
        engine.src = newUrl;
        engine.load();
        await sync();
      }
    };

    loadResource().catch(showError);
  }, [player.currentResource]);

  useEffect(() => {
    if (player.isOnline && engineRef.current?.src)
      sync().catch(showError);
  }, [player.status, sync, player.isOnline]);

  useEffect(() => {
    const interval = setInterval(() => sync().catch(showError), 2_000);

    return () => clearInterval(interval);
  }, [sync]);

  async function securePlayEngine() {
    const engine = engineRef.current;

    if (!engine)
      return;

    await withRetries(async ( { attempt } ) => {
      if (attempt > 1)
        engine.load();

      try {
        await withTimeout(async ()=> {
          await engine.play();
        }, 5_000);
      } catch (e) {
        if (!(e instanceof Error && e.name === "AbortError"))
          throw e;
      }
    }, {
      retries: 3,
      delay: 500,
      shouldRetry: async ( { lastError: e } ) => {
        if (!(e instanceof Error))
          return true;

        if (e.name === "NotSupportedError") {
          return await handleExoticAudio( {
            engine,
            sync,
          } );
        }

        if (e instanceof ErrorNoConnection)
          return false;

        return true;
      },
    } );
  }

  useAudioSilence();
  useMediaSession(engineRef.current);
  useOnline();
  useAudioEffects(engineRef.current);
  useHistoryLogger(engineRef.current);
  const { abort: abortPrefetchingFetch, waitForPrefetching } = usePrefetching();

  return null;
};

export function useOnline() {
  useEffect(() => {
    const { setIsOnline } = useBrowserPlayer.getState();

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
}

export async function withTimeout<T>(
  fn: ()=> Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await Promise.race([
      fn(),
      new Promise<T>((_, reject) => controller.signal.addEventListener("abort", () => reject(
        new Error(`Operation timed out after ${timeoutMs}ms`),
      ))),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function useAudioSilence() {
  const status = useBrowserPlayer(s=>s.status);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = new Audio();

    audioRef.current = audio;

    // eslint-disable-next-line daproj/max-len
    audio.src = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==";
    audio.loop = true;
    audio.volume = 0;
    audio.play()
      .catch(() => {

      /* empty */
      } );

    return () => {
      audio.pause();
      audio.removeAttribute("src");
    };
  }, []);

  useEffect(()=> {
    if (!audioRef.current)
      return;

    if (status === "playing") {
      if (audioRef.current.paused)
        audioRef.current.play().catch(showError);
    } else
      audioRef.current.pause();
  }, [status]);
}
