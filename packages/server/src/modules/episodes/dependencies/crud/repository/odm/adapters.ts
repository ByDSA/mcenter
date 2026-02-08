import { AllKeysOf } from "$shared/utils/types";
import { Types } from "mongoose";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { EpisodeDependency as Model, EpisodeDependencyEntity as Entity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";

function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret: Entity = {
    id: docOdm._id.toString(),
    lastEpisodeId: docOdm.lastEpisodeId.toString(),
    nextEpisodeId: docOdm.nextEpisodeId.toString(),
    last: docOdm.last ? EpisodeOdm.toEntity(docOdm.last) : undefined,
    next: docOdm.next ? EpisodeOdm.toEntity(docOdm.next) : undefined,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(ret);
}

function modelToDocOdm(model: Model): DocOdm {
  return {
    lastEpisodeId: new Types.ObjectId(model.lastEpisodeId),
    nextEpisodeId: new Types.ObjectId(model.nextEpisodeId),
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
