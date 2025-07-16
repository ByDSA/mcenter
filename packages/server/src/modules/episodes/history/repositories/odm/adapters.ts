import { EpisodeHistoryEntry as Entry, EpisodeHistoryEntryEntity as Entity } from "../../models";
import { DocOdm, ExpandedDocOdm } from "./mongo";
import { serieDocOdmToEntity } from "#series/repositories/odm";
import { episodeDocOdmToModel as episodeDocOdmToEntity } from "#episodes/repositories/adapters";

function docOdmToEntity(entryDocOdm: ExpandedDocOdm): Entity {
  const ret: Entity = {
    id: entryDocOdm._id.toString(),
    episodeId: {
      code: entryDocOdm.episodeId.code,
      serieId: entryDocOdm.episodeId.serieId,
    },
    date: {
      year: entryDocOdm.date.year,
      month: entryDocOdm.date.month,
      day: entryDocOdm.date.day,
      timestamp: entryDocOdm.date.timestamp,
    },
  };

  if (entryDocOdm.serie)
    ret.serie = serieDocOdmToEntity(entryDocOdm.serie);

  if (entryDocOdm.episode)
    ret.episode = episodeDocOdmToEntity(entryDocOdm.episode);

  return ret;
}

function modelToDocOdm(entry: Entry): DocOdm {
  return {
    episodeId: {
      code: entry.episodeId.code,
      serieId: entry.episodeId.serieId,
    },
    date: {
      year: entry.date.year,
      month: entry.date.month,
      day: entry.date.day,
      timestamp: entry.date.timestamp,
    },
  } as DocOdm;
}

export {
  docOdmToEntity as docOdmToEntryEntity,
  modelToDocOdm as entryToDocOdm,
};
