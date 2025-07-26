import { AllKeysOf } from "$shared/utils/types";
import { Types } from "mongoose";
import { EpisodeOdm } from "#episodes/repositories/odm";
import { SeriesOdm } from "#modules/series/repositories/odm";
import { StreamOdm } from "#modules/streams/repositories/odm";
import { EpisodeHistoryEntry as Entry, EpisodeHistoryEntryEntity as Entity } from "../../models";
import { DocOdm, FullDocOdm } from "./mongo";

function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret: Entity = {
    id: docOdm._id.toString(),
    episodeCompKey: {
      episodeKey: docOdm.episodeId.code,
      seriesKey: docOdm.episodeId.serieId,
    },
    date: {
      year: docOdm.date.year,
      month: docOdm.date.month,
      day: docOdm.date.day,
      timestamp: docOdm.date.timestamp,
    },
    streamId: docOdm.streamId.toString(),
    serie: docOdm.serie ? SeriesOdm.toEntity(docOdm.serie) : undefined,
    episode: docOdm.episode ? EpisodeOdm.toEntity(docOdm.episode) : undefined,
    stream: docOdm.stream ? StreamOdm.toEntity(docOdm.stream) : undefined,
  } satisfies AllKeysOf<Entity>;

  return ret;
}

function modelToDocOdm(model: Entry): DocOdm {
  return {
    episodeId: {
      code: model.episodeCompKey.episodeKey,
      serieId: model.episodeCompKey.seriesKey,
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
