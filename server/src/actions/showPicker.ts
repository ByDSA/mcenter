import { Request, Response } from "express";
import { getFromGroupId } from "../db/models/serie.model";
import { getById } from "../db/models/stream.model";
import { getDaysFrom } from "../EpisodePicker/EpisodeFilter";
import { getRandomPicker } from "../EpisodePicker/EpisodePicker";
import { getlastEp } from "./playStream";

export default async function (req: Request, res: Response) {
    const { streamId } = getParams(req, res);

    const stream = await getById(streamId);
    if (stream) {
        const seriePromise = getFromGroupId(stream.group);
        const lastEpPromise = getlastEp(stream);
        await Promise.all([seriePromise, lastEpPromise]);
        const serie = await seriePromise;
        const lastEp = await lastEpPromise;
        console.log("Received serie=" + serie?.id + " and lastEp=" + lastEp?.id);
        if (!serie) {
            res.sendStatus(404);
            return;
        }
        const picker = getRandomPicker(serie, lastEp, stream);
        const pickerWeight = picker.weight;
        let weightAcc = 0;
        const ret = picker.data.map(e => {
            const id = e.id;
            const selfWeight = picker.getWeight(e) || 1;
            const weight = Math.round(selfWeight / pickerWeight * 100 * 100) / 100;
            const days = Math.floor(getDaysFrom(e, stream.history));
            return [id, weight, selfWeight, days]
        }).sort((a: any, b: any) => {
            return b[1] - a[1];
        }).filter((e, i) => {
            weightAcc += +e[1];
            return weightAcc <= 80;
        });

        res.send(ret);
    } else
        res.sendStatus(404);
}

function getParams(req: Request, res: Response) {
    const { streamId } = req.params;

    if (!streamId)
        res.sendStatus(400);

    return {
        streamId
    }
}