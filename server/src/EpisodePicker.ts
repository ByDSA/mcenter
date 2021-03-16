import { WeightPicker, wrap } from "../src/randompicker/pickers/WeightPicker";
import { Episode } from "./db/models/episode";
import { History } from "./db/models/history";
import { getFromGroupId, Serie } from "./db/models/serie.model";
import { getById, Mode, Stream } from "./db/models/stream.model";
import { filter, fixWeight } from "./EpisodePickerMiddleware";

export default async function (streamId: string) {
    const stream = await getById(streamId);
    if (!stream)
        return null;

    const lastEp = await getlastEp(stream);
    console.log(`current: ${lastEp}`);
    console.log(`stream: ${stream}`);
    const nextEpisodeId = await calculateNextEpisode(stream);
    console.log(`next: ${nextEpisodeId}`)

    return nextEpisodeId;
};

async function getlastEp(stream: Stream): Promise<Episode | null> {
    let lastEp = null;
    if (stream.history.length > 0) {
        const lastHistory: History = stream.history[stream.history.length - 1];
        const lastEpId = lastHistory.episodeId;
        const serie = await getFromGroupId(stream.group);
        lastEp = serie?.episodes.find(e => e.id === lastEpId) || null;
    }

    return lastEp;
}

type FuncGenerator = (serie: Serie, lastEp: Episode | null, stream: Stream) => Episode;
export async function calculateNextEpisode(stream: Stream) {
    const groupId: string = stream.group;
    const serie = await getFromGroupId(groupId);
    if (!serie)
        throw new Error(`Cannot get serie frop group '${groupId}'`);

    let nextEpisodeFunc: FuncGenerator;
    switch (stream.mode) {
        case Mode.SEQUENTIAL:
            nextEpisodeFunc = getNextEpisodeSequential;
            break;
        case Mode.RANDOM:
            nextEpisodeFunc = getNextEpisodeRandom;
            break;
        default:
            throw new Error(`Mode invalid: ${stream.mode}.`);
    }

    const lastEp = await getlastEp(stream);
    return nextEpisodeFunc(serie, lastEp, stream);
}

function getNextEpisodeSequential(serie: Serie, lastEp: Episode | null): Episode {
    const episodes = serie.episodes;
    let i = 0;
    if (lastEp) {
        i = episodes.findIndex(e => e.id === lastEp.id) + 1;
        if (i >= episodes.length)
            i = 0;
    }

    return episodes[i];
}

function getNextEpisodeRandom(serie: Serie, lastEp: Episode | null, stream: Stream): Episode {
    const episodes = serie.episodes;

    let weightEpisodes = episodes.map(e => wrap(e));

    weightEpisodes = filter(weightEpisodes, serie, lastEp, stream);
    fixWeight(weightEpisodes, serie, lastEp, stream);

    const picker = new WeightPicker(weightEpisodes);

    const ret = picker.pickOne();

    if (!ret)
        throw new Error();

    return ret;
}
