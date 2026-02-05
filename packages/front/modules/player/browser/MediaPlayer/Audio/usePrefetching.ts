import { useEffect, useRef, useState, useCallback } from "react";
import { showError } from "$shared/utils/errors/showError";
import { useMusic } from "#musics/hooks";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { getUrlSkipHistory } from "./audioUtils";
import { useAudioCache } from "./AudioCacheContext";
import { convertAudio } from "./exotic-audio";
import { DEFAULT_FFMPEG_TTL, DEFAULT_TTL, shouldPrefetch } from "./usePrefetchingVars";

export function usePrefetching() {
  const currentTime = useBrowserPlayer(s => s.currentTime);
  const duration = useBrowserPlayer(s => s.duration);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const doingRef = useRef<boolean>(false);
  const prefetchPromiseRef = useRef<Promise<void> | null>(null);
  const resolvePromiseRef = useRef<(()=> void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  const waitForPrefetching = useCallback(async () => {
    if (prefetchPromiseRef.current)
      await prefetchPromiseRef.current;
  }, []);

  useEffect(() => {
    if (duration === undefined || !shouldPrefetch(currentTime, duration))
      return;

    if (doingRef.current)
      return;

    const fn = async () => {
      doingRef.current = true;

      try {
        const { nextResource, getNext, setNextResource, queue } = useBrowserPlayer.getState();
        const { add, has, hasNextAction } = useAudioCache.getState();
        const now = Date.now();

        if (nextResource?.nextAction && hasNextAction(nextResource.nextAction))
          return;

        setIsPrefetching(true);
        prefetchPromiseRef.current = new Promise<void>((resolve) => {
          resolvePromiseRef.current = resolve;
        } );

        const nextAction = await getNext();

        setNextResource( {
          date: now,
          nextAction,
        } );

        if (!nextAction)
          return;

        const resourceId = nextAction.type === "INDEX"
          ? queue[nextAction.payload].resourceId
          : nextAction.payload.id;

        if (has(resourceId))
          return;

        const url = await getUrlSkipHistory(resourceId);
        let music = await useMusic.get(resourceId);

        if (!music?.fileInfos)
          music = await useMusic.fetch(resourceId);

        const ext = music?.fileInfos?.[0].path.split(".").pop();
        let blob: Blob;
        let ttl: number;

        if (ext && ["mp3", "flac", "wav"].includes(ext)) {
          const controller = new AbortController();

          abortControllerRef.current = controller;

          try {
            const res = await fetch(url, {
              signal: controller.signal,
            } );

            blob = await res.blob();
            ttl = DEFAULT_TTL;
          } finally {
            abortControllerRef.current = null;
          }
        } else {
          const converted = await convertAudio(url);

          if (!converted)
            return;

          blob = converted.audioBlob;
          ttl = DEFAULT_FFMPEG_TTL;
        }

        add(resourceId, blob, {
          ttl,
        } );
      } catch (error: any) {
        if (error.name !== "AbortError")
          showError(error);
      } finally {
        doingRef.current = false;
        setIsPrefetching(false);
        // Notificamos a quienes estén haciendo await
        resolvePromiseRef.current?.();

        // Limpiamos los refs para la próxima ejecución
        prefetchPromiseRef.current = null;
        resolvePromiseRef.current = null;
      }
    };

    fn().catch(showError);
  }, [currentTime, duration, abort]);

  return {
    isPrefetching,
    abort,
    waitForPrefetching,
  };
}
