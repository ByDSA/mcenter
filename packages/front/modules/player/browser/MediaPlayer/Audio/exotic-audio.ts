import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { logger } from "#modules/core/logger";
import { useBrowserPlayer } from "../BrowserPlayerContext";
import { getUrlSkipHistory } from "./audioUtils";
import { useAudioCache } from "./AudioCacheContext";

let ffmpegInstance: FFmpeg | null = null;

export async function convertAudio(fileUrl: string) {
  if (typeof window === "undefined")
    return null;

  // 1. Inicialización
  if (!ffmpegInstance) {
    const ffmpeg = new FFmpeg();

    await ffmpeg.load();
    ffmpegInstance = ffmpeg;
  }

  const ffmpeg = ffmpegInstance;
  const inputName = `input_${Date.now()}`;
  const outputName = `output_${Date.now()}.wav`;

  await ffmpeg.writeFile(inputName, await fetchFile(fileUrl));

  // Usamos -acodec pcm_s16le para que sea un WAV estándar que el navegador lea al instante
  await ffmpeg.exec(["-i", inputName, "-acodec", "pcm_s16le", outputName]);

  const data = await ffmpeg.readFile(outputName);
  const uint8Array = new Uint8Array(data as Uint8Array);
  const audioBlob = new Blob([uint8Array.buffer], {
    type: "audio/wav",
  } );
  const url = URL.createObjectURL(audioBlob);

  // Limpieza de memoria virtual de FFmpeg
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return {
    url,
    audioBlob,
  };
}

export async function handleExoticAudio(params: {
  engine: HTMLAudioElement;
  sync: ()=> Promise<void>;
} ) {
  const { engine, sync } = params;

  logger.info("Formato no soportado nativamente, intentando Exotic Audio...");
  try {
    const { currentResource } = useBrowserPlayer.getState();

    if (!currentResource)
      throw new Error("No hay recurso actual para Exotic Audio");

    const skipUrl = await getUrlSkipHistory(currentResource.resourceId);
    const converted = await convertAudio(skipUrl);

    if (!converted)
      throw new Error("Error converting");

    const { add } = useAudioCache.getState();

    add(currentResource.resourceId, converted.audioBlob);
    engine.src = converted.url;
    engine.load();
    await sync();

    return false;
  } catch (exoticErr) {
    logger.error("Exotic Audio falló", exoticErr);
    engine.removeAttribute("src");

    return true;
  }
}
