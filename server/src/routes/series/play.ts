/* eslint-disable no-await-in-loop */
import { Request, Response } from "express";
import { findResourceFromItem, ResourceInterface } from "../../db/models/resource";
import { findSerieByUrl } from "../../db/models/serie";
import { VideoInterface } from "../../db/models/video";
import pickNext, { GroupPicker } from "../../GroupPicker/GroupPicker";
import PlayProcess from "../../play/PlayProcess";

export async function playEpisode(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { urlEpisode, urlSerie } = req.params;
  const serie = await findSerieByUrl(urlSerie);

  if (!serie) {
    res.sendStatus(404);

    return;
  }

  const episode = serie.episodes.find((e) => e.url === urlEpisode);

  // TODO: add to history

  if (episode)
    play([episode], force);

  res.send(episode);
}

export async function play(episodes: VideoInterface[], openNewInstance: boolean) {
  await new PlayProcess(episodes, openNewInstance).do();
}

export async function pickAndAddHistory(
  groupPicker: GroupPicker,
  n: number,
): Promise<ResourceInterface[]> {
  const episodes = [];

  for (let i = 0; i < n; i++) {
    const item = await pickNext(groupPicker);
    const episode = await findResourceFromItem(item);

    if (episode) {
      // TODO: add to history
      episodes.push(episode);
    } else
      break;
  }

  return episodes;
}
