import YoutubeMp3Downloader from "youtube-mp3-downloader";
import { ENVS } from "./utils";

export function download(str: string): Promise<any> {
  const ytDownloader = new YoutubeMp3Downloader( {
    ffmpegPath: "ffmpeg", // FFmpeg binary location
    outputPath: ENVS.mediaPath, // Output file location (default: the home directory)
    youtubeVideoQuality: "highestaudio", // Desired video quality (default: highestaudio)
    queueParallelism: 2, // Download parallelism (default: 1)
    progressTimeout: 2000, // Interval in ms for the progress reports (default: 1000)
    allowWebm: false, // Enable download from WebM sources (default: false)
  } );
  const id = getIdFromStr(str);

  ytDownloader.download(id);

  return new Promise((solve, reject) => {
    ytDownloader.on("finished", (err, data) => {
      if (err) {
        reject(err);

        return;
      }

      solve(data);
    } );
  } );
}

function getIdFromStr(str: string): string {
  const LONG_PRE = "youtube.com/watch?v=";
  const SHORT_PRE = "youtu.be/Sj_9CiNkkn4";
  let ret = str;

  if (str.startsWith(LONG_PRE))
    ret = str.substr(str.indexOf(LONG_PRE) + LONG_PRE.length);

  else if (str.startsWith(SHORT_PRE))
    ret = str.substr(str.indexOf(SHORT_PRE) + SHORT_PRE.length);

  return ret.substr(0, 11);
}
