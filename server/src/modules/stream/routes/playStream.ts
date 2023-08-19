import { PlayService, VLCService } from "#modules/play";
import { StreamRepository } from "#modules/stream";
import { assertFound, assertHasItems } from "#modules/utils/base/http/asserts";
import { Request, Response } from "express";
import StreamService from "../StreamService";

export default async function f(req: Request, res: Response) {
  console.log("playStream");
  const { id, number, force } = parseParams(req, res);
  const streamService = new StreamService();
  const vlcService = new VLCService();
  const playService = new PlayService(vlcService);
  const streamRepository = StreamRepository.getInstance<StreamRepository>();
  const stream = await streamRepository.findOneById(id);

  assertFound(stream);

  const episodes = await streamService.pickNextEpisode(stream, number);

  await playService.play(episodes, {
    force,
  } );

  res.send(episodes);
}

function parseParams(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  const number = +(req.params.number ?? 1);

  if (!id)
    res.sendStatus(400);

  return {
    id,
    number,
    force,
  };
}
