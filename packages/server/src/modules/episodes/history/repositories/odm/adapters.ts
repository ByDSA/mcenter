import { serieDocOdmToEntity } from "#series/repositories/odm";
import { EpisodeOdm } from "#episodes/repositories/odm";
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
  };

  if (docOdm.serie)
    ret.serie = serieDocOdmToEntity(docOdm.serie);

  if (docOdm.episode)
    ret.episode = EpisodeOdm.docToEntity(docOdm.episode);

  return ret;
}

function modelToDocOdm(entry: Entry): DocOdm {
  return {
    episodeId: {
      code: entry.episodeCompKey.episodeKey,
      serieId: entry.episodeCompKey.seriesKey,
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
