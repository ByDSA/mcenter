import { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { SeriesOdm } from "#modules/series/crud/repository/odm";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { Episode, EpisodeEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Episode {
  const model: Episode = {
    compKey: {
      episodeKey: docOdm.episodeKey,
      seriesKey: docOdm.seriesKey,
    },
    title: docOdm.title,
    weight: docOdm.weight,
    timestamps: TimestampsOdm.toModel(docOdm.timestamps),
    disabled: docOdm.disabled,
    tags: docOdm.tags,
    lastTimePlayed: docOdm.lastTimePlayed,
    uploaderUserId: docOdm.uploaderUserId.toString(),
  } satisfies AllKeysOf<Episode>;

  return removeUndefinedDeep(model);
}

export function docOdmToEntity(docOdm: FullDocOdm): EpisodeEntity {
  const ret: EpisodeEntity = {
    ...docOdmToModel(docOdm),
    id: docOdm._id.toString(),
  };

  if (docOdm.fileInfos)
    ret.fileInfos = docOdm.fileInfos.map(EpisodeFileInfoOdm.toEntity);

  if (docOdm.serie)
    ret.serie = SeriesOdm.toEntity(docOdm.serie);

  return ret;
}

export function entityToDocOdm(entity: EpisodeEntity): FullDocOdm {
  const ret: FullDocOdm = {
    ...episodeToDocOdm(entity),
    _id: new Types.ObjectId(entity.id),
  };

  return ret;
}

export function episodeToDocOdm(model: Episode): DocOdm {
  const ret = {
    title: model.title,
    weight: model.weight,
    timestamps: model.timestamps,
    episodeKey: model.compKey.episodeKey,
    seriesKey: model.compKey.seriesKey,
    disabled: model.disabled,
    tags: model.tags,
    lastTimePlayed: model.lastTimePlayed,
    uploaderUserId: new Types.ObjectId(model.uploaderUserId),
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(ret);
}

export function partialModelToDocOdm(model: Partial<EpisodeEntity>): MongoUpdateQuery<DocOdm> {
  const ret: MongoUpdateQuery<DocOdm> = {};

  if (model.compKey !== undefined) {
    ret.episodeKey = model.compKey.episodeKey;

    ret.seriesKey = model.compKey.seriesKey;
  }

  if (model.title !== undefined)
    ret.title = model.title;

  if ("weight" in model) {
    if (model.weight !== undefined)
      ret.weight = model.weight;
    else {
      ret.$unset = ret.$unset ?? {};
      ret.$unset.weight = 1;
    }
  }

  if ("disabled" in model) {
    if (model.disabled !== undefined)
      ret.disabled = model.disabled;
    else {
      ret.$unset = ret.$unset ?? {};
      ret.$unset.disabled = 1;
    }
  }

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if ("lastTimePlayed" in model) {
    if (model.lastTimePlayed !== undefined)
      ret.lastTimePlayed = model.lastTimePlayed;
    else {
      ret.$unset = ret.$unset ?? {};
      ret.$unset.lastTimePlayed = 1;
    }
  }

  return ret;
}
