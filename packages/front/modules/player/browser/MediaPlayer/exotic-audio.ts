import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

export async function playExoticAudio(fileUrl: string) {
  if (typeof window === "undefined")
    return "";

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

  return url;
}
