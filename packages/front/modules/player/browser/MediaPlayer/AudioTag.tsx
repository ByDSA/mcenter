import assert from "node:assert";
import { PATH_ROUTES } from "$shared/routing";
import { showError } from "$shared/utils/errors/showError";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { withRetries } from "#modules/utils/retries";
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

  function securePlay() {
    const audio = audioRef.current;

    assert(!!audio);

    return withRetries(async ( { attempt } )=> {
      if (attempt !== 1)
        audio.load(); // Recarga el recurso

      await audio.play();
    }, {
      retries: 3,
      delay: 1_000,
      shouldRetry: async ( { lastError: e, attempt: i } ) => {
        if (!(e instanceof Error)) {
          logger.error(e);

          return true;
        }

        // Ignorar error de interrupción por carga (común en navegación rápida)
        if (e.name === "AbortError")
          return false;

        logger.error(e.name + ": " + e.message + " retryCount: " + i);

        if (e.name === "NotSupportedError") {
          const newUrl = await playExoticAudio(urlSkipHistory);

          audio.src = newUrl;

          if (useBrowserPlayer.getState().status === "playing")
            await securePlay();

          return false;
        }

        return true;
      },
    } );
  }

  // Efecto para controlar el play/pause
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !player.currentResource)
      return;

    if (player.status === "playing") {
      securePlay()
        .then(()=> {
          const { status } = useBrowserPlayer.getState();

          if (status === "paused")
            audio.pause();
        } )
        .catch(showError);
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

  useAudioSilenceRef();

  const isOnline = useOnlineStatus();

  useEffect(()=> {
    const { status: currentStatus } = useBrowserPlayer.getState();

    if (
      isOnline === true && audioRef.current?.paused && currentStatus === "playing"
    ) {
      securePlay()
        .catch(showError);
    }
  }, [isOnline]);

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
    onPause={()=> {
      if (player.status === "playing")
        securePlay().catch(showError);
    }}
    onEnded={async () => {
      if (player.status !== "playing")
        return;

      if (player.repeatMode === RepeatMode.One && audioRef.current) {
        player.setCurrentTime(0, {
          audioRef: audioRef,
        } );
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

    initAudioPipeline();

    return () => window.removeEventListener("click", resumeContext);
  }, [audioRef.current, audioContextRef.current]);

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
}

function useAudioSilenceRef() {
  const silenceRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let audioCtx;
    const keepAlive = () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gainNode = audioCtx.createGain();

        gainNode.gain.value = 0; // Silencio absoluto
        const oscillator = audioCtx.createOscillator();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
      }
    };

    keepAlive();

    return ()=> {
      audioCtx?.close();
    };
  }, []);

  return silenceRef;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Actualizar el estado con el valor inicial del navegador
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      console.log("¡Conexión restablecida!");
      setIsOnline(true);
      // Aquí puedes disparar cualquier lógica global (ej. resincronizar datos)
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
