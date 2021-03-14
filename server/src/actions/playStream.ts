import { exec, execSync } from "child_process";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { Episode } from "../db/models/episode.model";
import { addToHistory, getById, Stream } from "../db/models/stream.model";
import { calculateNextEpisode } from "../EpisodePicker";
import { MediaElement } from "../m3u/MediaElement";
import { QueuePlaylistManager } from "../m3u/QueuePlaylistManager";
import { isRunning } from "../Utils";

dotenv.config();
const { MEDIA_PATH, TMP_PATH } = process.env;

export default async function (req: Request, res: Response) {
    const { id, number, force } = getParams(req, res);

    const stream = await getById(id);

    if (!stream) {
        res.sendStatus(404);
        return;
    }

    const episodes = await pickAndAddHistory(stream, +number);

    let forceBoolean: boolean = !!+force;
    await play(episodes, forceBoolean);

    res.send(episodes);
};

async function play(episodes: Episode[], openNewInstance: boolean) {
    const queue = new QueuePlaylistManager(TMP_PATH || "/");
    if (queue.nextNumber === 0)
        openNewInstance = true;
    else if (openNewInstance) {
        await closeVLC();
        queue.clear();
    }

    const elements: MediaElement[] = episodes.map(e => {
        return {
            path: MEDIA_PATH + e.path,
            title: e.title,
            startTime: e.start,
            stopTime: e.end,
            length: e.duration
        };
    });
    queue.add(...elements);

    if (openNewInstance) {
        const file = queue.firstFile;
        openVLC(file);
    }
}

async function closeVLC() {
    while (await isRunning("vlc")) {
        try {
            execSync("killall vlc");
        } catch (e) {
            break;
        }
    }
}

async function openVLC(file: string) {
    const p2 = exec(`"vlc" ${file} --play-and-exit --no-video-title-show --aspect-ratio 16:9 -f --qt-minimal-view --no-repeat --no-loop --one-instance`);
}

async function pickAndAddHistory(stream: Stream, n: number): Promise<Episode[]> {
    const episodes = [];
    for (let i = 0; i < +n; i++) {
        const episode = await calculateNextEpisode(stream);
        await addToHistory(stream, episode);
        episodes.push(episode);
    }

    return episodes;
}

function getParams(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    let { id, number } = req.params;

    if (!id) {
        res.sendStatus(400);
    }

    if (!number)
        number = "1";

    return {
        id,
        number,
        force
    }
}