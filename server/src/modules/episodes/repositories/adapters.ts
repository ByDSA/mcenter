/* eslint-disable import/prefer-default-export */
import { Model } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Model {
  const model: Model = {
    episodeId: docOdm.episodeId,
    serieId: docOdm.serieId,
    path: docOdm.path,
    title: docOdm.title ?? "",
    start: docOdm.start ?? -1,
    end: docOdm.end ?? -1,
    weight: docOdm.weight ?? 0,
  };

  if (docOdm.duration !== undefined)
    model.duration = docOdm.duration;

  if (docOdm.disabled !== undefined)
    model.disabled = docOdm.disabled;

  if (docOdm.tags !== undefined)
    model.tags = docOdm.tags;

  if (docOdm.lastTimePlayed !== undefined)
    model.lastTimePlayed = docOdm.lastTimePlayed;

  return model;
}

export function modelToDocOdm(model: Model): DocOdm {
  const ret: DocOdm = {
    episodeId: model.episodeId,
    serieId: model.serieId,
    path: model.path,
    title: model.title ?? "",
    start: model.start ?? -1,
    end: model.end ?? -1,
    weight: model.weight ?? 0,
  };

  if (model.duration !== undefined)
    ret.duration = model.duration;

  if (model.disabled !== undefined)
    ret.disabled = model.disabled;

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if (model.lastTimePlayed !== undefined)
    ret.lastTimePlayed = model.lastTimePlayed;

  return ret;
}