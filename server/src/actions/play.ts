import dotenv from "dotenv";
import { Request, Response } from "express";
import { Episode, episodeToMediaElement } from "../db/models/episode";
import { getById } from "../db/models/serie.model";
import { addToHistory, getById as getStreamById, Stream } from "../db/models/stream.model";
import { calculateNextEpisode } from "../EpisodePicker/EpisodePicker";
import { MediaElement } from "../m3u/MediaElement";
import { QueuePlaylistManager } from "../m3u/QueuePlaylistManager";
import { isRunning } from "../Utils";
import { VLC, VLCFlag } from "../vlc/VLC";

dotenv.config();
const { TMP_PATH } = process.env;

export default async function (req: Request, res: Response) {
  const { id, type, force } = getParams(req, res);
}

export async function playSerieFunc(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id, name } = req.params;
  const serie = await getById(name);

  if (!serie) {
    res.sendStatus(404);

    return;
  }

  const episode = serie.episodes.find((e) => e.id === id);

  getStreamById(name).then((stream) => {
    if (stream && episode)
      addToHistory(stream, episode);
  } );

  if (episode)
    play([episode], force);

  res.send(episode);
}

function getParams(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id, type } = req.params;

  if (!id || !type) {
    res.status(400);
    res.send("No ID nor TYPE.");
    res.end();
  }

  switch (type) {
    case "serie":
    case "peli":
      break;
    default:
      res.status(400);
      res.send(`Type '${type}' is invalid.`);
      res.end();
  }

  return {
    id,
    type,
    force,
  };
}

class PlayProcess {
    private queue: QueuePlaylistManager;

    constructor(private episodes: Episode[], private openNewInstance: boolean) {
      this.queue = new QueuePlaylistManager(TMP_PATH || "/");
    }

    async closeIfNeeded() {
      if (this.openNewInstance || await isRunning("vlc") && this.queue.nextNumber === 0)
        await closeVLC();
    }

    async openIfNeeded() {
      if (!await isRunning("vlc")) {
        this.openNewInstance = true;

        if (this.queue.nextNumber > 0)
          this.queue.clear();
      }
    }

    async do() {
      console.log(`Play function: ${this.episodes[0].id}`);

      await this.closeIfNeeded();

      await this.openIfNeeded();

      const elements: MediaElement[] = this.episodes.map(episodeToMediaElement);

      this.queue.add(...elements);

      if (this.openNewInstance) {
        const file = this.queue.firstFile;
        const process = await openVLC(file);

        process.on("exit", (code: number) => {
          if (code === 0)
            this.queue.clear();

          console.log("Closed VLC");
        } );
      }
    }
}

export async function play(episodes: Episode[], openNewInstance: boolean) {
  await new PlayProcess(episodes, openNewInstance).do();
}

async function closeVLC() {
  await VLC.closeAll();
}

const vlcConfig = [
  VLCFlag.PLAY_AND_EXIT,
  VLCFlag.NO_VIDEO_TITLE,
  VLCFlag.ASPECT_RATIO, "16:9",
  VLCFlag.FULLSCREEN,
  VLCFlag.MINIMAL_VIEW,
  VLCFlag.NO_REPEAT,
  VLCFlag.NO_LOOP,
  VLCFlag.ONE_INSTANCE];

async function openVLC(file: string): Promise<VLC> {
  const vlc = new VLC();

  vlc.config(...vlcConfig);
  await vlc.open(file);

  return vlc;
}

export async function pickAndAddHistory(stream: Stream, n: number): Promise<Episode[]> {
  const episodes = [];

  for (let i = 0; i < +n; i++) {
    const episode = await calculateNextEpisode(stream);

    await addToHistory(stream, episode);
    episodes.push(episode);
  }

  return episodes;
}
