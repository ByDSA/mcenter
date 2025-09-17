import ffmpeg from "fluent-ffmpeg";

interface AudioInfo {
  duration?: number;
  format?: string;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  codec?: string;
  size?: number;
  metadata?: any;
}

export async function getAudioInfo(filePath: string): Promise<AudioInfo> {
  return await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);

        return;
      }

      const audioStream = metadata.streams.find(stream => stream.codec_type === "audio");
      const info: AudioInfo = {
        duration: metadata.format.duration,
        format: metadata.format.format_name,
        bitrate: metadata.format.bit_rate ? +metadata.format.bit_rate / 1000 : undefined, // en kbps
        size: metadata.format.size,
        metadata: metadata.format.tags,
        ...(audioStream && {
          codec: audioStream.codec_name,
          sampleRate: audioStream.sample_rate,
          channels: audioStream.channels,
        } ),
      };

      resolve(info);
    } );
  } );
}
