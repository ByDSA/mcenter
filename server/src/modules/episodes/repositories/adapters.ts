import { Episode, assertIsEpisode } from "#shared/models/episodes";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Episode {
  const model: Episode = {
    episodeId: docOdm.episodeId,
    serieId: docOdm.serieId,
    path: docOdm.path,
    title: docOdm.title ?? "",
    start: docOdm.start ?? -1,
    end: docOdm.end ?? -1,
    weight: docOdm.weight ?? 0,
  };

  if (docOdm.disabled !== undefined)
    model.disabled = docOdm.disabled;

  if (docOdm.tags !== undefined)
    model.tags = docOdm.tags;

  if (docOdm.lastTimePlayed !== undefined)
    model.lastTimePlayed = docOdm.lastTimePlayed;

  assertIsEpisode(model);

  return model;
}

export function modelToDocOdm(model: Episode): DocOdm {
  assertIsEpisode(model);
  const ret: DocOdm = {
    episodeId: model.episodeId,
    serieId: model.serieId,
    path: model.path,
    title: model.title,
    start: model.start,
    end: model.end,
    weight: model.weight,
  };

  if (model.disabled !== undefined)
    ret.disabled = model.disabled;

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if (model.lastTimePlayed !== undefined)
    ret.lastTimePlayed = model.lastTimePlayed;

  return ret;
}

export function partialModelToDocOdm(model: Partial<Episode>): Partial<DocOdm> {
  const ret: Partial<DocOdm> = {
  };

  if (model.episodeId !== undefined)
    ret.episodeId = model.episodeId;

  if (model.serieId !== undefined)
    ret.serieId = model.serieId;

  if (model.path !== undefined)
    ret.path = model.path;

  if (model.title !== undefined)
    ret.title = model.title;

  if (model.start !== undefined)
    ret.start = model.start;

  if (model.end !== undefined)
    ret.end = model.end;

  if (model.weight !== undefined)
    ret.weight = model.weight;

  if (model.disabled !== undefined)
    ret.disabled = model.disabled;

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if (model.lastTimePlayed !== undefined)
    ret.lastTimePlayed = model.lastTimePlayed;

  return ret;
}