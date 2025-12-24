import { PATH_ROUTES } from "$shared/routing";
import { showError } from "$shared/utils/errors/showError";
import { RefObject, useEffect, useMemo, useRef } from "react";
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

  useAudioContext(audioRef);

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

function useAudioContext(audioRef: AudioRef) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const compressionValue = useBrowserPlayer(s=>s.compressionValue);

  useEffect(() => {
    if (!compressorRef.current || !limiterRef.current || !audioContextRef.current)
      return;

    const ctx = audioContextRef.current;
    const t = ctx.currentTime;
    // Threshold: de 0 (nada) a -40 (máximo)
    const compThreshold = 0 + (compressionValue * -40);
    // Ratio: de 1 (nada) a 15 (máximo)
    const compRatio = 1 + (compressionValue * 14);

    compressorRef.current.threshold.setValueAtTime(compThreshold, t);
    compressorRef.current.ratio.setValueAtTime(compRatio, t);

    // Threshold: de 0 (nada) a -20 (máximo)
    const limThreshold = 0 + (compressionValue * -20);
    // Ratio: de 1 (nada) a 20 (máximo)
    const limRatio = 1 + (compressionValue * 19);

    limiterRef.current.threshold.setValueAtTime(limThreshold, t);
    limiterRef.current.ratio.setValueAtTime(limRatio, t);
  }, [compressionValue, compressorRef.current, limiterRef.current, audioContextRef.current]);

  useEffect(() => {
    if (audioContextRef.current)
      return;

    const initAudioPipeline = () => {
      if (!audioRef.current || typeof window === "undefined")
        return;

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();

      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      // Crear Nodos
      const compressor = ctx.createDynamicsCompressor();
      const limiter = ctx.createDynamicsCompressor();

      // Configuración fija (tiempos de reacción)
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      limiter.knee.setValueAtTime(0, ctx.currentTime);
      limiter.attack.setValueAtTime(0.001, ctx.currentTime);
      limiter.release.setValueAtTime(0.1, ctx.currentTime);

      // Referencias para poder actualizarlos luego
      compressorRef.current = compressor;
      limiterRef.current = limiter;

      // CONEXIÓN CORRECTA EN SERIE:
      // Source -> Compressor -> Limiter -> Destination
      source.connect(compressor);
      compressor.connect(limiter);
      limiter.connect(ctx.destination);
    };
    const resumeContext = async () => {
      if (!audioContextRef.current)
        initAudioPipeline();

      if (audioContextRef.current?.state === "suspended")
        await audioContextRef.current.resume();
    };

    window.addEventListener("click", resumeContext, {
      once: true,
    } );

    return () => window.removeEventListener("click", resumeContext);
  }, [audioRef.current, audioContextRef.current]);
}
