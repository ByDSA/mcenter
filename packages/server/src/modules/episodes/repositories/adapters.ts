// eslint-disable-next-line import/no-internal-modules
import { timestampsDocOdmToModel } from "#modules/resources/odm/Timestamps";
import { UpdateQuery } from "mongoose";
import { Model as Episode, assertIsModel as assertIsEpisode } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Episode {
  const model: Episode = {
    id: {
      innerId: docOdm.episodeId,
      serieId: docOdm.serieId,
    },
    path: docOdm.path,
    title: docOdm.title,
    start: docOdm.start,
    end: docOdm.end,
    weight: docOdm.weight,
    timestamps:
      docOdm.timestamps
        ? timestampsDocOdmToModel(docOdm.timestamps)
        : {
          createdAt: new Date(),
          updatedAt: new Date(),
          addedAt: new Date(),
        },
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
    episodeId: model.id.innerId,
    serieId: model.id.serieId,
    path: model.path,
    title: model.title,
    start: model.start,
    end: model.end,
    weight: model.weight,
    timestamps: model.timestamps,
  };

  if (model.disabled !== undefined)
    ret.disabled = model.disabled;

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if (model.lastTimePlayed !== undefined)
    ret.lastTimePlayed = model.lastTimePlayed;

  return ret;
}

export function partialModelToDocOdm(model: Partial<Episode>): UpdateQuery<Episode> {
  const ret: UpdateQuery<Episode> = {
  };

  if (model.id !== undefined) {
    ret.episodeId = model.id.innerId;

    ret.serieId = model.id.serieId;
  }

  if (model.path !== undefined)
    ret.path = model.path;

  if (model.title !== undefined)
    ret.title = model.title;

  if (model.start !== undefined)
    ret.start = model.start;

  if (model.end !== undefined)
    ret.end = model.end;

  if ("weight" in model){
    if (model.weight !== undefined)
      ret.weight = model.weight;
    else {
      ret.$unset = ret.$unset ?? {
      };
      ret.$unset.weight = 1;
    }
  }

  if ("disabled" in model)
  {if (model.disabled !== undefined)
    ret.disabled = model.disabled;
  else {
    ret.$unset = ret.$unset ?? {
    };
    ret.$unset.disabled = 1;
  }}

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if ("lastTimePlayed" in model)
  {if (model.lastTimePlayed !== undefined)
    ret.lastTimePlayed = model.lastTimePlayed;
  else {
    ret.$unset = ret.$unset ?? {
    };
    ret.$unset.lastTimePlayed = 1;
  }}

  return ret;
}