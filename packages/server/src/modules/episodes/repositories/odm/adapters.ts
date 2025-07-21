import { Types, UpdateQuery } from "mongoose";
import { timestampsDocOdmToModel } from "#modules/resources/odm/Timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/repositories/odm";
import { Episode, EpisodeEntity, assertIsEpisode } from "../../models";
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

export function docOdmToEntity(docOdm: FullDocOdm): EpisodeEntity {
  return {
    ...docOdmToModel(docOdm),
    id: docOdm._id.toString(),
    fileInfos: docOdm.fileInfos ? docOdm.fileInfos.map(EpisodeFileInfoOdm.docToEntity) : undefined,
  };
}

export function entityToDocOdm(entity: EpisodeEntity): FullDocOdm {
  return {
    ...episodeToDocOdm(entity),
    _id: new Types.ObjectId(entity.id),
    fileInfos: entity.fileInfos ? entity.fileInfos.map(EpisodeFileInfoOdm.entityToDoc) : undefined,
  };
}

export function episodeToDocOdm(model: Episode): DocOdm {
  assertIsEpisode(model);
  const ret: Partial<DocOdm> = {
    title: model.title,
    weight: model.weight,
    timestamps: model.timestamps,
    episodeId: model.compKey.episodeKey,
    serieId: model.compKey.seriesKey,
  };

  if (model.disabled !== undefined)
    ret.disabled = model.disabled;

  if (model.tags !== undefined)
    ret.tags = model.tags;

  if (model.lastTimePlayed !== undefined)
    ret.lastTimePlayed = model.lastTimePlayed;

  return ret as DocOdm;
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
