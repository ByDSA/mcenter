import { showError } from "$shared/utils/errors/showError";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { withRetries } from "#modules/utils/retries";
import { ErrorNoConnection } from "#modules/core/errors/custom-errors";
import { RepeatMode, useBrowserPlayer } from "../BrowserPlayerContext";
import { useAudioElement } from "./AudioContext";
import { getUrlSkipHistory, useMediaSession } from "./audioUtils";
import { handleExoticAudio } from "./exotic-audio";
import { useAudioPipeline } from "./useAudioPipeline";
import { useHistoryLogger } from "./useHistoryLogger";
import { usePrefetching } from "./usePrefetching";
import { useAudioCache } from "./AudioCacheContext";

export type AudioRef = RefObject<HTMLAudioElement | null>;

/**
 * AUDIO ENGINE
 * - Carrier (DOM): Mantiene la sesión viva con silencio.
 * - Engine (Memoria): Procesa el audio real a través del AudioContext.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AudioTag = () => {
  const player = useBrowserPlayer(useShallow((s) => ( {
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

  // Inicialización única del Engine
  if (!engineRef.current && typeof Audio !== "undefined") {
    const audio = new Audio();

    // IMPORTANTE: crossOrigin debe ir antes de cualquier src para evitar tainted canvas/audio context errors
    audio.crossOrigin = "use-credentials";
    audio.preload = "auto";
    engineRef.current = audio;
  }

  // Contexto Global para la UI (ProgressBar, etc)
  const [, setGlobalAudioElement] = useAudioElement();

  useEffect(() => {
    if (engineRef.current)
      setGlobalAudioElement(engineRef.current);
  }, [setGlobalAudioElement]);

  const isOnline = useOnline();
  const syncingRef = useRef(false);

  usePrefetching();

  useAudioPipeline(engineRef.current);

  useHistoryLogger(engineRef.current, player.currentResource?.resourceId);

  useEffect(() => {
    const loadResource = async () => {
      const engine = engineRef.current;

      if (!engine)
        return;

      if (!player.currentResource) {
        engine.pause();
        engine.removeAttribute("src");
        engine.load();
        await sync();

        return;
      }

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

  const sync = useCallback(async () => {
    if (syncingRef.current)
      return;

    syncingRef.current = true;

    try {
      const engine = engineRef.current;

      if (!engine)
        return;

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

  useEffect(() => {
    if (isOnline && engineRef.current?.src)
      sync().catch(showError);
  }, [player.status, sync, isOnline]);

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
        await engine.play();
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

  useEffect(() => {
    const engine = engineRef.current;

    if (!engine)
      return;

    const onTimeUpdate = () => player.setCurrentTime(engine.currentTime);
    const onDurationChange = () => {
      const d = engine.duration;

      if (isFinite(d))
        useBrowserPlayer.getState().setDuration(d);
    };
    const onEnded = async () => {
      if (player.repeatMode === RepeatMode.One)
        engine.currentTime = 0;
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

      const audio = engineRef.current;

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
        audio.currentTime = saveTime;
        await sync();
      }
    };

    engine.addEventListener("timeupdate", onTimeUpdate);
    engine.addEventListener("durationchange", onDurationChange);
    engine.addEventListener("ended", onEnded);
    engine.addEventListener("error", onError);
    engine.addEventListener("waiting", checkBlobAndFix);
    engine.addEventListener("seeking", checkBlobAndFix);

    return () => {
      engine.removeEventListener("timeupdate", onTimeUpdate);
      engine.removeEventListener("durationchange", onDurationChange);
      engine.removeEventListener("ended", onEnded);
      engine.removeEventListener("error", onError);
      engine.removeEventListener("waiting", checkBlobAndFix);
      engine.removeEventListener("seeking", checkBlobAndFix);
    };
  }, [player.repeatMode]);

  useMediaSession(engineRef.current, player);

  return null;
};

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
