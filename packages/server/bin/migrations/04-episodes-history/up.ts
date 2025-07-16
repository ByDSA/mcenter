/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import assert from "node:assert";
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
  // Get Old data
  const oldDocs: OldDocOdm[] = await OldModelOdm.find();

  // Transform and insert new data
  const newDocs: NewDocOdm[] = [];
  let oldCount = 0;

  for (const doc of oldDocs) {
      const entries = doc.entries;

      oldCount += entries.length;
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

    // Tests

    console.log("Doing tests ...");
    const inserted = await NewModelOdm.find();
    assert(inserted.length === oldCount, `Inserted: ${inserted.length}. OldCount: ${oldCount}`);
    for (const n of inserted)
      assertIsEpisodeHistoryEntryEntity(entryDocOdmToEntryEntity(n));

    main: for(const n of inserted) {
      for (const o of oldDocs) {
        for (const e of o.entries)
          if (e.date.timestamp === n.date.timestamp && e.episodeId === n.episodeId.code && e.serieId === n.episodeId.serieId)
            continue main;

        }
        throw new Error("Not found in old docs: " + JSON.stringify(n));
    }

    console.log("Tests completed!")
}