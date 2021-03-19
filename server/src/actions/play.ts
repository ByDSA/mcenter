import { exec, execSync } from "child_process";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { Episode } from "../db/models/episode";
import { getById } from "../db/models/serie.model";
import { addToHistory, getById as getStreamById, Stream } from "../db/models/stream.model";
import { calculateNextEpisode } from "../EpisodePicker";
import { MediaElement } from "../m3u/MediaElement";
import { QueuePlaylistManager } from "../m3u/QueuePlaylistManager";
import { isRunning } from "../Utils";
dotenv.config();
const { MEDIA_PATH, TMP_PATH } = process.env;

export default async function (req: Request, res: Response) {
    const { id, type, force } = getParams(req, res);

};

export async function playSerieFunc(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id, name } = req.params;

    const serie = await getById(name);

    if (!serie) {
        res.sendStatus(404);
        return;
    }

    const episode = serie.episodes.find(e => e.id === id);

    getStreamById(name).then(stream => {
        if (stream && episode)
            addToHistory(stream, episode);
    });

    if (episode)
        play([episode], force);

    res.send(episode);
};

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
        force
    }
}

export async function play(episodes: Episode[], openNewInstance: boolean) {
    console.log("Play function: " + episodes[0].id);
    const queue = new QueuePlaylistManager(TMP_PATH || "/");

    if (!await isRunning("vlc"))
        openNewInstance = true;
    if (openNewInstance || queue.nextNumber > 0) {
        if (openNewInstance)
            await closeVLC();
        queue.clear();
        openNewInstance = true;
    }

    const elements: MediaElement[] = episodes.map(e => {
        return {
            path: `${MEDIA_PATH}/${e.path}`,
            title: e.title,
            startTime: e.start,
            stopTime: e.end,
            length: e.duration
        };
    });
    queue.add(...elements);

    if (openNewInstance) {
        const file = queue.firstFile;
        const process = openVLC(file);
        process.on("exit", (code: number) => {
            if (code === 0)
                queue.clear();

            console.log("Closed VLC")
        })
    }
}

async function closeVLC() {
    while (await isRunning("vlc")) {
        try {
            console.log("Closing VLC...");
            execSync("killall vlc");
        } catch (e) {
            console.log("Error closing VLC");
            break;
        }
    }
}

function openVLC(file: string): any {
    console.log("Open VLC: " + file);
    const p2 = exec(`"vlc" ${file} --play-and-exit --no-video-title-show --aspect-ratio 16:9 -f --qt-minimal-view --no-repeat --no-loop --one-instance`);
    return p2;
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