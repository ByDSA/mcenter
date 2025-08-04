import { AllKeysOf } from "$shared/utils/types";
import { Types } from "mongoose";
import { EpisodeOdm } from "#episodes/crud/repository/odm";
import { EpisodeDependency as Model, EpisodeDependencyEntity as Entity } from "../../../models";
import { DocOdm, FullDocOdm } from "./mongo";

function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret: Entity = {
    id: docOdm._id.toString(),
    lastCompKey: {
      episodeKey: docOdm.lastCompKey.episodeKey,
      seriesKey: docOdm.lastCompKey.seriesKey,
    },
    nextCompKey: {
      episodeKey: docOdm.nextCompKey.episodeKey,
      seriesKey: docOdm.nextCompKey.seriesKey,
    },
    last: docOdm.last ? EpisodeOdm.toEntity(docOdm.last) : undefined,
    next: docOdm.next ? EpisodeOdm.toEntity(docOdm.next) : undefined,
  } satisfies AllKeysOf<Entity>;

  return ret;
}

function modelToDocOdm(model: Model): DocOdm {
  return {
    lastCompKey: {
      episodeKey: model.lastCompKey.episodeKey,
      seriesKey: model.lastCompKey.seriesKey,
    },
    nextCompKey: {
      episodeKey: model.nextCompKey.episodeKey,
      seriesKey: model.nextCompKey.seriesKey,
    },
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;
}

function entityToFullDocOdm(entry: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entry),
    _id: new Types.ObjectId(entry.id),
  } as FullDocOdm;
}

export {
  docOdmToEntity,
  modelToDocOdm,
  entityToFullDocOdm,
};
