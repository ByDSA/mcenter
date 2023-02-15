/* eslint-disable no-await-in-loop */
import dotenv from "dotenv";
import { Request, Response } from "express";
import { calculateNextEpisode, Episode, episodeToMediaElement } from "#modules/episode";
import { HistoryRepository } from "#modules/history";
import { MediaElement, QueuePlaylistManager, VLC, VLCFlag } from "#modules/player";
import { SerieRepository } from "#modules/serie";
import { Stream, StreamRepository } from "#modules/stream";
import { isRunning } from "#modules/utils";

dotenv.config();
const { TMP_PATH } = process.env;

// eslint-disable-next-line func-names, require-await
export default async function (req: Request, res: Response) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, type, force } = getParams(req, res);
}

export async function playSerieFunc(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id, name } = req.params;
  const serie = await SerieRepository.getInstance<SerieRepository>().findOneById(name);

  if (!serie) {
    res.sendStatus(404);

    return;
  }

  const episode = serie.episodes.find((e) => e.id === id);
  const streamRepo = StreamRepository.getInstance<StreamRepository>();

  streamRepo.findOneById(name)
    .then((stream) => {
      if (stream && episode)
        HistoryRepository.getInstance<HistoryRepository>().addToHistory(stream, episode);
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
    if (this.openNewInstance || (await isRunning("vlc") && this.queue.nextNumber === 0))
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
  await VLC.closeAllAsync();
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
  await vlc.openFileAsync(file);

  return vlc;
}

export async function pickAndAddHistory(stream: Stream, n: number): Promise<Episode[]> {
  const episodes: Episode[] = [];

  for (let i = 0; i < +n; i++) {
    const episode = await calculateNextEpisode(stream);

    await HistoryRepository.getInstance<HistoryRepository>().addToHistory(stream, episode);
    episodes.push(episode);
  }

  return episodes;
}
