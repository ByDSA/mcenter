import { newPicker } from "rand-picker";
import { getlastEp } from "./actions/playStream";
import { Episode } from "./db/models/episode";
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
    const picker = getRandomPicker(serie, lastEp, stream);
    const ret = picker.pickOne();

    if (!ret)
        throw new Error();

    return ret;
}

export function getRandomPicker(serie: Serie, lastEp: Episode | null, stream: Stream) {
    const episodes = serie.episodes;
    const picker = newPicker(episodes, {
        weighted: true
    });
    filter(picker, serie, lastEp, stream);
    fixWeight(picker, serie, lastEp, stream);

    return picker;
}
