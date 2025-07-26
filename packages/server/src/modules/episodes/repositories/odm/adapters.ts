import { Types, UpdateQuery } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { timestampsDocOdmToModel } from "#modules/resources/odm/Timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/repositories/odm";
import { SeriesOdm } from "#modules/series/repositories/odm";
import { Episode, EpisodeEntity } from "../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Episode {
  const model: Episode = {
    compKey: {
      episodeKey: docOdm.episodeId,
      seriesKey: docOdm.serieId,
    },
    title: docOdm.title,
    weight: docOdm.weight,
    timestamps: timestampsDocOdmToModel(docOdm.timestamps),
    disabled: docOdm.disabled,
    tags: docOdm.tags,
    lastTimePlayed: docOdm.lastTimePlayed,
  } satisfies AllKeysOf<Episode>;

  return model;
}

export function docOdmToEntity(docOdm: FullDocOdm): EpisodeEntity {
  return {
    ...docOdmToModel(docOdm),
    id: docOdm._id.toString(),
    fileInfos: docOdm.fileInfos ? docOdm.fileInfos.map(EpisodeFileInfoOdm.toEntity) : undefined,
    serie: docOdm.serie ? SeriesOdm.toEntity(docOdm.serie) : undefined,
  };
}

export function entityToDocOdm(entity: EpisodeEntity): FullDocOdm {
  return {
    ...episodeToDocOdm(entity),
    _id: new Types.ObjectId(entity.id),
    fileInfos: entity.fileInfos ? entity.fileInfos.map(EpisodeFileInfoOdm.toFullDoc) : undefined,
  };
}

export function episodeToDocOdm(model: Episode): DocOdm {
  return {
    title: model.title,
    weight: model.weight,
    timestamps: model.timestamps,
    episodeId: model.compKey.episodeKey,
    serieId: model.compKey.seriesKey,
    disabled: model.disabled,
    tags: model.tags,
    lastTimePlayed: model.lastTimePlayed,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;
}

export function partialModelToDocOdm(model: Partial<EpisodeEntity>): UpdateQuery<Episode> {
  const ret: UpdateQuery<Episode> = {};

  if (model.compKey !== undefined) {
    ret.episodeId = model.compKey.episodeKey;

    ret.serieId = model.compKey.seriesKey;
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
