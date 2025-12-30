import assert from "node:assert";
import { PATH_ROUTES } from "$shared/routing";
import { showError } from "$shared/utils/errors/showError";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { backendUrl } from "#modules/requests";
import { logger } from "#modules/core/logger";
import { withRetries } from "#modules/utils/retries";
import { useMusic } from "#modules/musics/hooks";
import { ErrorNoConnection } from "#modules/core/errors/custom-errors";
import { useBrowserPlayer, RepeatMode, PlaylistQueueItem } from "./BrowserPlayerContext";
import { playExoticAudio } from "./exotic-audio";
import { useAudioElement } from "./AudioContext";

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
  const [audioElement, setAudioElement] = useAudioElement();
  const [urlSkipHistory, setUrlSkipHistory] = useState<string>("");
  const [url, setUrl] = useState<URL | null>(null);
  const exoticAudioProcess = useRef(false);

  useEffect(() => {
    getUrlSkipHistory(player.currentResource)
      .then(setUrlSkipHistory)
      .catch(showError);
    getUrl(player.currentResource)
      .then(setUrl)
      .catch(showError);
  }, [player.currentResource]);

  async function securePlay() {
    assert(!!audioElement);

    if (exoticAudioProcess.current)
      return;

    return await withRetries(async ( { attempt } )=> {
      if (exoticAudioProcess.current)
        return;

      if (attempt !== 1)
        audioElement.load(); // Recarga el recurso

      await audioElement.play();
    }, {
      retries: 3,
      delay: 1_000,
      shouldRetry: async ( { lastError: e, attempt: i } ) => {
        if (!(e instanceof Error)) {
          logger.error(e);

          return true;
        }

        // AbortError: Ignorar error de interrupción por carga (común en navegación rápida)
        if (e.name === "AbortError" || e instanceof ErrorNoConnection)
          return false;

        if (e.name === "NotSupportedError") {
          logger.info("Convirtiendo archivo ...");
          const skipUrl = await getUrlSkipHistory(player.currentResource);

          try {
            exoticAudioProcess.current = true;
            const newUrl = await playExoticAudio(skipUrl);

            exoticAudioProcess.current = false;
            logger.info("Convertido!");

            audioElement.src = newUrl;
          } catch (e2) {
            exoticAudioProcess.current = false;
            logger.error(e2);

            return true;
          }

          if (useBrowserPlayer.getState().status === "playing")
            await securePlay();

          return false;
        }

        logger.error(e.name + ": " + e.message + " retryCount: " + i);

        return true;
      },
    } );
  }

  // Efecto para controlar el play/pause
  useEffect(() => {
    if (!audioElement)
      return;

    if (player.status === "playing") {
      if (audioElement.paused) {
        securePlay()
          .then(()=> {
            const { status } = useBrowserPlayer.getState();

            if (status !== "playing")
              audioElement.pause();
          } )
          .catch(showError);
      }
    } else if (!audioElement.paused)
      audioElement.pause();
  }, [player.status, audioElement]);

  useEffect(() => {
    if (!audioElement)
      return;

    const update = () => {
      if (audioElement)
        player.setCurrentTime(audioElement.currentTime);
    };

    audioElement.addEventListener("timeupdate", update);

    return () => audioElement.removeEventListener("timeupdate", update);
  }, [audioElement]);

  useAudioContext(audioElement);

  useAudioSilenceRef();

  useOnlineAutoPlay(audioElement, securePlay);

  if (!urlSkipHistory)
    return null;

  return <audio
    ref={(node)=>setAudioElement(node)}
    src={urlSkipHistory}
    crossOrigin="use-credentials"
    onDurationChange={()=> {
      const { duration, setDuration } = useBrowserPlayer.getState();

      if (duration === undefined)
        setDuration(audioElement!.duration);
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

      if (audioElement?.paused && player.status === "playing")
        securePlay().catch(showError);
    }}
    onPause={()=> {
      if (player.status === "playing" && audioElement?.currentTime !== audioElement?.duration)
        securePlay().catch(showError);
    }}
    onEnded={async () => {
      if (player.status !== "playing")
        return;

      if (player.repeatMode === RepeatMode.One && audioElement) {
        player.setCurrentTime(0, {
          audioElement,
        } );
      } else if (player.hasNext()) {
        try {
          await player.next();
        } catch (e) {
          if (e instanceof Error && !(e instanceof ErrorNoConnection))
            logger.error(e.message);
        }
      } else
        player.stop();
    }}
  />;
};

function useAudioContext(audioElement: HTMLAudioElement | null) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const compressionValue = useBrowserPlayer(s => s.compressionValue);
  const initAudioPipeline = useCallback(() => {
    if (!audioElement || typeof window === "undefined")
      return;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();

    audioContextRef.current = ctx;

    const source = ctx.createMediaElementSource(audioElement);
    const compressor = ctx.createDynamicsCompressor();
    const limiter = ctx.createDynamicsCompressor();

    // ---------------------------------------------------------
    // CORRECCIÓN: Inicializar con valores NEUTROS (Bypass)
    // ---------------------------------------------------------
    // 1. Matar el "Knee" por defecto (era 30, causaba compresión suave siempre)
    compressor.knee.setValueAtTime(0, ctx.currentTime);
    // 2. Quitar valores agresivos por defecto (eran -24dB y Ratio 12)
    compressor.threshold.setValueAtTime(0, ctx.currentTime);
    compressor.ratio.setValueAtTime(1, ctx.currentTime);

    // Configuración de tiempos (esto estaba bien)
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    // Configuración del Limitador (Bypass inicial)
    limiter.threshold.setValueAtTime(0, ctx.currentTime);
    limiter.ratio.setValueAtTime(1, ctx.currentTime);

    // Tiempos del limitador
    limiter.knee.setValueAtTime(0, ctx.currentTime);
    limiter.attack.setValueAtTime(0.001, ctx.currentTime);
    limiter.release.setValueAtTime(0.1, ctx.currentTime);

    compressorRef.current = compressor;
    limiterRef.current = limiter;

    source.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(ctx.destination);

    // Forzamos una actualización inmediata con el valor actual del estado
    // por si el useEffect tarda un ciclo en entrar.
    updateCompressionParams(compressor, limiter, ctx, useBrowserPlayer.getState().compressionValue);
  }, [audioElement]);
  // Extraje la lógica de actualización para poder reusarla
  const updateCompressionParams = (
    comp: DynamicsCompressorNode,
    lim: DynamicsCompressorNode,
    ctx: AudioContext,
    val: number,
  ) => {
    const t = ctx.currentTime;
    // Threshold: de 0 a -40
    const compThreshold = 0 + (val * -40);
    // Ratio: de 1 a 15 (Ratio 1 = Sin compresión)
    const compRatio = 1 + (val * 14);

    comp.threshold.setTargetAtTime(compThreshold, t, 0.1); // setTargetAtTime suaviza la transición
    comp.ratio.setTargetAtTime(compRatio, t, 0.1);

    const limThreshold = 0 + (val * -20);
    const limRatio = 1 + (val * 19);

    lim.threshold.setTargetAtTime(limThreshold, t, 0.1);
    lim.ratio.setTargetAtTime(limRatio, t, 0.1);
  };

  useEffect(() => {
    if (!compressorRef.current || !limiterRef.current || !audioContextRef.current)
      return;

    updateCompressionParams(
      compressorRef.current,
      limiterRef.current,
      audioContextRef.current,
      compressionValue,
    );
  }, [compressionValue]); // Quitamos las otras dependencias que son refs estables

  useEffect(() => {
    if (audioContextRef.current)
      return;

    const resumeContext = async () => {
      if (!audioContextRef.current)
        initAudioPipeline();

      if (audioContextRef.current?.state === "suspended")
        await audioContextRef.current.resume();
    };

    window.addEventListener("click", resumeContext, {
      once: true,
    } );

    if (!audioContextRef.current)
      initAudioPipeline();

    return () => window.removeEventListener("click", resumeContext);
  }, [audioElement, audioContextRef.current]);
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

export function useOnlineAutoPlay(
  audioElement: HTMLAudioElement | null,
  securePlay: (
)=> Promise<void>,
) {
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

  useEffect(()=> {
    if (!audioElement)
      return;

    const fn = async () => {
      const { status: currentStatus, hasNext, next } = useBrowserPlayer.getState();

      while (isOnline && audioElement.paused && currentStatus === "playing") {
        try {
          if (audioElement.currentTime >= audioElement.duration && hasNext())
            await next();
          else
            await securePlay();
        } catch (e) {
          if (e instanceof Error && !(e instanceof ErrorNoConnection))
            logger.error(e.message);
        }
      }
    };

    fn().catch(showError);
  }, [isOnline]);

  return isOnline;
}

const getUrl = async (currentResource: PlaylistQueueItem | null) => {
  if (!currentResource)
    return null;

  const music = await useMusic.get(currentResource.resourceId);

  if (!music)
    return null;

  const base = backendUrl(PATH_ROUTES.musics.slug.withParams(music.slug));
  const u = new URL(base);

  u.searchParams.set("format", "raw");

  return u;
};
const getUrlSkipHistory = async (currentResource: PlaylistQueueItem | null) => {
  const url = await getUrl(currentResource);

  if (!url)
    return "";

  const u = new URL(url.href);

  u.searchParams.set("skip-history", "1");

  return u.href;
};
