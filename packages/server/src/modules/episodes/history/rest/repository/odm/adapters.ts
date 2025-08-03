import { AllKeysOf } from "$shared/utils/types";
import { Types } from "mongoose";
import { EpisodeOdm } from "#episodes/rest/repository/odm";
import { StreamOdm } from "#modules/streams/rest/repository/odm";
import { EpisodeHistoryEntry as Entry, EpisodeHistoryEntryEntity as Entity } from "../../../models";
import { DocOdm, FullDocOdm } from "./mongo";

function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret: Entity = {
    id: docOdm._id.toString(),
    resourceId: {
      episodeKey: docOdm.episodeCompKey.episodeKey,
      seriesKey: docOdm.episodeCompKey.seriesKey,
    },
    date: {
      year: docOdm.date.year,
      month: docOdm.date.month,
      day: docOdm.date.day,
      timestamp: docOdm.date.timestamp,
    },
    streamId: docOdm.streamId.toString(),
    resource: docOdm.episode ? EpisodeOdm.toEntity(docOdm.episode) : undefined,
    stream: docOdm.stream ? StreamOdm.toEntity(docOdm.stream) : undefined,
  } satisfies AllKeysOf<Entity>;

  return ret;
}

function modelToDocOdm(model: Entry): DocOdm {
  return {
    episodeCompKey: {
      episodeKey: model.resourceId.episodeKey,
      seriesKey: model.resourceId.seriesKey,
    },
    date: {
      year: model.date.year,
      month: model.date.month,
      day: model.date.day,
      timestamp: model.date.timestamp,
    },
    streamId: new Types.ObjectId(model.streamId),
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
