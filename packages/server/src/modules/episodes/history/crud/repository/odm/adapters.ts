import { AllKeysOf } from "$shared/utils/types";
import { Types } from "mongoose";
import { EpisodeHistoryEntry as Entry, EpisodeHistoryEntryEntity as Entity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";
import { EpisodeOdm } from "#episodes/crud/repositories/episodes/odm";
import { StreamOdm } from "#episodes/streams/crud/repository/odm";
import { UserOdm } from "#core/auth/users/crud/repository/odm";

function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret: Entity = {
    id: docOdm._id.toString(),
    resourceId: docOdm.episodeId.toString(),
    date: docOdm.date,
    streamId: docOdm.streamId.toString(),
    resource: docOdm.episode ? EpisodeOdm.toEntity(docOdm.episode) : undefined,
    stream: docOdm.stream ? StreamOdm.toEntity(docOdm.stream) : undefined,
    userId: docOdm.userId.toString(),
    user: docOdm.user ? UserOdm.toEntity(docOdm.user) : undefined,
  } satisfies AllKeysOf<Entity>;

  return ret;
}

function modelToDocOdm(model: Entry): DocOdm {
  return {
    episodeId: new Types.ObjectId(model.resourceId),
    date: model.date,
    streamId: new Types.ObjectId(model.streamId),
    userId: new Types.ObjectId(model.userId),
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
