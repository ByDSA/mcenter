import { useEffect, useRef } from "react";
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
  const doingRef = useRef<boolean>(false);

  useEffect(() => {
    if (duration === undefined || !shouldPrefetch(currentTime, duration))
      return;

    const fn = async () => {
      const { nextResource, getNext, setNextResource, queue } = useBrowserPlayer.getState();
      const { add, has, hasNextAction } = useAudioCache.getState();
      const now = Date.now();

      if (nextResource?.nextAction && hasNextAction(nextResource.nextAction))
        return;

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
      const music = await useMusic.get(resourceId);
      const ext = music?.fileInfos?.[0].path
        .split(".").pop();
      let blob: Blob;
      let ttl: number;

      if (ext && ["mp3", "flac", "wav"].includes(ext)) {
        const res = await fetch(url);

        blob = await res.blob();
        ttl = DEFAULT_TTL;
      } else {
        const converted = await convertAudio(url);

        if (!converted)
          return;

        blob = converted.audioBlob;
        ttl = DEFAULT_FFMPEG_TTL;
      }

      // Guardamos en nuestro store manual
      add(resourceId, blob, {
        ttl,
      } );
    };

    if (doingRef.current)
      return;

    doingRef.current = true;
    fn()
      .catch(showError)
      .finally(()=> {
        doingRef.current = false;
      } );
  }, [currentTime, duration]);
}
