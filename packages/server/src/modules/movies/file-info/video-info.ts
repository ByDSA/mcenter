import ffmpeg from "fluent-ffmpeg";

interface VideoInfo {
  duration?: number;
  format?: string;
  bitrate?: number;
  size?: number;
  metadata?: any;
  resolution?: {
    width: number | null;
    height: number | null;
  };
  fps?: string | null;
}

export async function getVideoInfo(filePath: string): Promise<VideoInfo> {
  return await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);

        return;
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === "video");
      const info: VideoInfo = {
        duration: metadata.format.duration,
        format: metadata.format.format_name,
        bitrate: metadata.format.bit_rate ? +metadata.format.bit_rate / 1000 : undefined, // en kbps
        size: metadata.format.size,
        metadata: metadata.format.tags,
        ...(videoStream && {
          resolution: {
            width: videoStream.width ?? null,
            height: videoStream.height ?? null,
          },
          fps: videoStream.r_frame_rate ?? null,
        } ),
      };

      resolve(info);
    } );
  } );
}
