import { getRandomPicker } from "#modules/series/episode";
import { getDaysFromLastPlayed } from "#modules/series/episode/lastPlayed";
import { SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
import { Request, Response } from "express";

export default async function f(req: Request, res: Response) {
  const { streamId } = getParams(req, res);
  const stream = await StreamRepository.getInstance<StreamRepository>().findOneById(streamId);

  if (stream) {
    const seriePromise = SerieRepository.getInstance<SerieRepository>().findOneFromGroupId(stream.group);
    const lastEpPromise = SerieRepository.getInstance<SerieRepository>().findLastEpisodeInStream(stream);

    await Promise.all([seriePromise, lastEpPromise]);
    const serie = await seriePromise;
    const lastEp = await lastEpPromise;

    console.log(`Received serie=${serie?.id} and lastEp=${lastEp?.id}`);

    if (!serie) {
      res.sendStatus(404);

      return;
    }

    const picker = await getRandomPicker(serie, lastEp, stream);
    const pickerWeight = picker.weight;
    let weightAcc = 0;
    const ret = picker.data.map((e) => {
      const { id } = e;
      const selfWeight = picker.getWeight(e) || 1;
      const weight = Math.round((selfWeight / pickerWeight) * 100 * 100) / 100;
      const days = Math.floor(getDaysFromLastPlayed(e, serie.id, stream.history));

      return [id, weight, selfWeight, days];
    } ).sort((a: any, b: any) => b[1] - a[1])
      .filter((e) => {
        weightAcc += +e[1];

        return weightAcc <= 80;
      } );

    res.send(ret);
  } else
    res.sendStatus(404);
}

function getParams(req: Request, res: Response) {
  const { streamId } = req.params;

  if (!streamId)
    res.sendStatus(400);

  return {
    streamId,
  };
}
