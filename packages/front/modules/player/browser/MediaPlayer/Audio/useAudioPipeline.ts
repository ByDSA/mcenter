import { useEffect, useRef, useCallback } from "react";
import { logger } from "#modules/core/logger";
import { useBrowserPlayer } from "../BrowserPlayerContext";

interface AudioNodes {
  source: MediaElementAudioSourceNode;
  compressor: DynamicsCompressorNode;
  limiter: DynamicsCompressorNode;
}

export function useAudioPipeline(audioElement: HTMLAudioElement | null) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNodes | null>(null);
  const compressionValue = useBrowserPlayer(s => s.compressionValue);
  const setupAudioGraph = useCallback(() => {
    if (!audioElement || typeof window === "undefined" || nodesRef.current)
      return;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;

    if (!ctxRef.current)
      ctxRef.current = new AudioContextClass();

    const ctx = ctxRef.current!;

    try {
      const source = ctx.createMediaElementSource(audioElement);
      const compressor = ctx.createDynamicsCompressor();
      const limiter = ctx.createDynamicsCompressor();

      initializeCompressor(compressor, ctx);
      initializeLimiter(limiter, ctx);

      // Conexión del flujo: Source -> Compressor -> Limiter -> Destination
      source.connect(compressor);
      compressor.connect(limiter);
      limiter.connect(ctx.destination);

      nodesRef.current = {
        source,
        compressor,
        limiter,
      };

      applyDynamicCompression(compressor, limiter, ctx, compressionValue);
    } catch (error) {
      logger.error("AudioPipeline: Failed to connect nodes", error);
    }
  }, [audioElement]);

  useEffect(() => {
    if (nodesRef.current && ctxRef.current) {
      const { compressor, limiter } = nodesRef.current;

      applyDynamicCompression(compressor, limiter, ctxRef.current, compressionValue);
    }
  }, [compressionValue]);

  useEffect(() => {
    if (!audioElement)
      return;

    setupAudioGraph();

    const resumeContext = async () => {
      if (ctxRef.current?.state === "suspended")
        await ctxRef.current.resume();
    };
    const interactions = ["click", "touchstart", "keydown"];

    interactions.forEach(event => window.addEventListener(event, resumeContext, {
      once: true,
    } ));

    return () => {
      interactions.forEach(event => window.removeEventListener(event, resumeContext));
    };
  }, [audioElement, setupAudioGraph]);
}

function initializeCompressor(node: DynamicsCompressorNode, ctx: AudioContext) {
  node.threshold.setValueAtTime(-50, ctx.currentTime);
  node.knee.setValueAtTime(40, ctx.currentTime);
  node.ratio.setValueAtTime(12, ctx.currentTime);
  node.attack.setValueAtTime(0, ctx.currentTime);
  node.release.setValueAtTime(0.25, ctx.currentTime);
}

function initializeLimiter(node: DynamicsCompressorNode, ctx: AudioContext) {
  node.threshold.setValueAtTime(0, ctx.currentTime);
  node.knee.setValueAtTime(0, ctx.currentTime);
  node.ratio.setValueAtTime(20, ctx.currentTime);
  node.attack.setValueAtTime(0.005, ctx.currentTime);
  node.release.setValueAtTime(0.05, ctx.currentTime);
}

function applyDynamicCompression(
  comp: DynamicsCompressorNode,
  lim: DynamicsCompressorNode,
  ctx: AudioContext,
  value: number,
) {
  const now = ctx.currentTime;
  const timeConstant = 0.1;
  // Mapeo de valores de slider a parámetros de audio
  const thresholdValue = value * -40; // Rango 0 a -40
  const ratioValue = 1 + (value * 14); // Rango 1 a 15

  comp.threshold.setTargetAtTime(thresholdValue, now, timeConstant);
  comp.ratio.setTargetAtTime(ratioValue, now, timeConstant);

  // El limitador asegura que no haya clipping (0dB)
  lim.threshold.setTargetAtTime(-1.0, now, timeConstant);
}
