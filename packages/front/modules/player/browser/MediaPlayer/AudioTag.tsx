import { PATH_ROUTES } from "$shared/routing";
import { showError } from "$shared/utils/errors/showError";
import { RefObject, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { backendUrl } from "#modules/requests";
import { useBrowserPlayer, RepeatMode } from "./BrowserPlayerContext";
import { playExoticAudio } from "./exotic-audio";
import { useAudioRef } from "./AudioContext";

export type AudioRef = RefObject<HTMLAudioElement | null>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AudioTag = () => {
  const player = useBrowserPlayer(useShallow((s) => ( {
    currentResource: s.currentResource,
    status: s.status,
    setCurrentTime: s.setCurrentTime,
    repeatMode: s.repeatMode,
    next: s.next,
    stop: s.stop,
    hasNext: s.hasNext,
  } )));
  const audioRef = useAudioRef();

  // Efecto para controlar el play/pause
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !player.currentResource)
      return;

    if (player.status === "playing") {
      audio.play().catch(async (e) => {
        if (e.name === "NotSupportedError") {
          const newUrl = await playExoticAudio(urlSkipHistory);

          audio.src = newUrl;

          if (useBrowserPlayer.getState().status === "playing")
            await audio.play();
          // Ignorar error de interrupción por carga (común en navegación rápida)
        } else if (e.name !== "AbortError")
          console.error(e);
      } );
    } else
      audio.pause();
  }, [player.status, player.currentResource]);

  const url = useMemo(() => {
    if (!player.currentResource)
      return null;

    const base = backendUrl(PATH_ROUTES.musics.slug.withParams(player.currentResource.slug));
    const u = new URL(base);

    u.searchParams.set("format", "raw");

    return u;
  }, [player.currentResource]);
  const urlSkipHistory = useMemo(() => {
    if (!url)
      return "";

    const u = new URL(url.href);

    u.searchParams.set("skip-history", "1");

    return u.href;
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio)
      return;

    const update = () => {
      if (audioRef.current)
        player.setCurrentTime(audioRef.current.currentTime);
    };

    audio.addEventListener("timeupdate", update);

    return () => audio.removeEventListener("timeupdate", update);
  }, [audioRef.current]);

  return <audio
    ref={audioRef}
    src={urlSkipHistory}
    crossOrigin="use-credentials"
    onDurationChange={()=> {
      const { duration, setDuration } = useBrowserPlayer.getState();

      if (duration === undefined)
        setDuration(audioRef.current!.duration);
    }}
    onLoadedData={() => {
      if (url) {
        fetch(url.href, {
          credentials: "include",
          cache: "no-store",
          headers: {
            Range: "bytes=0-0",
          },
        } ).catch(showError);
      }
    }}
    onEnded={async () => {
      if (player.status !== "playing")
        return;

      if (player.repeatMode === RepeatMode.One && audioRef.current) {
        player.setCurrentTime(0, {
          audioRef: audioRef,
        } );
        await audioRef.current.play();
      } else if (player.hasNext())
        await player.next();
      else
        player.stop();
    }}
  />;
};
