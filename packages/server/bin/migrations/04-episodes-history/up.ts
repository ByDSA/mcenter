/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import { Database } from "../../../src/main/db/Database";
import { assertIsEpisodeHistoryEntryEntity } from "./new/episodes-history-entries/history-entry";
import { EpisodeHistoryEntriesDocOdm as MusicNewDocOdm, EpisodeHistoryEntriesModelOdm as NewModelOdm, entryDocOdmToEntryEntity } from "./new/episodes-history-entries/odm";
import { HistoryListDocOdm, HistoryListModelOdm as OldModelOdm } from "./old/episodes-history-list";

type OldDocOdm = HistoryListDocOdm;
type NewDocOdm = MusicNewDocOdm;

(async function up() {
  const database = new Database();

  await database.connect();

  await migration();

  await database.disconnect();
} )();

async function migration() {
  const oldDocs = await OldModelOdm.find();
  const newDocs: NewDocOdm[] = [];

  for (const doc of oldDocs) {

      const entries = doc.entries;

      for(const e of entries) {
        const retE: Omit<NewDocOdm,"_id">  = {
          date: e.date,
          episodeId: {
            code: e.episodeId,
            serieId: e.serieId
          }
        } satisfies Omit<NewDocOdm,"_id">;

        newDocs.push(retE as NewDocOdm);
      }
    };

    await NewModelOdm.deleteMany();
    await NewModelOdm.insertMany(newDocs);

    const inserted = await NewModelOdm.find();
    for (const n of inserted)
      assertIsEpisodeHistoryEntryEntity(entryDocOdmToEntryEntity(n));

}