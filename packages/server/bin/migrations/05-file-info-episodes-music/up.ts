/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import assert from "node:assert";
import { Database } from "../../../src/main/db/Database";
import { DocOdm as OldEpisodeFileInfoDocOdm } from "./old/episodes/file-info/odm";
import { DocOdm as OldEpisodeDocOdm } from "./old/episodes/odm";
import { DocOdm as OldMusicDocOdm } from "./old/musics/odm";
import { EpisodeFileInfoOdm } from "../../../src/modules/episodes/file-info/repositories/odm";
import { EpisodeOdm } from "../../../src/modules/episodes/repositories/odm";
import { assertIsEpisodeEntity } from "../../../src/modules/episodes/models";
import { assertIsEpisodeFileInfoEntity } from "../../../src/modules/episodes/file-info/models";
import { DocOdm as MusicDocOdm, ModelOdm as MusicModelOdm, assertIsMusicEntity, musicDocOdmToEntity, MusicFileInfoDocOdm, musicFileInfoDocOdmToEntity, assertIsMusicFileInfoEntity, MusicFileInfoModelOdm } from "./new/musics";
import { ModelOdm as OldMusicModelOdm } from "./old/musics/odm";
import { ModelOdm as OldEpisodeModelOdm } from "./old/episodes/odm";
import { ModelOdm as OldEpisodeFileInfoModelOdm } from "./old/episodes/file-info/odm";
import { statSync } from "node:fs";
import { assertIsDefined } from "$shared/utils/validation";

const ENVS = {
  MEDIA_FOLDER_PATH: process.env.MEDIA_FOLDER_PATH as string,
};

if (!ENVS.MEDIA_FOLDER_PATH)
  throw new Error("process.env.MEDIA_FOLDER_PATH is undefined");
else
  console.log("process.env.MEDIA_PATH:", ENVS.MEDIA_FOLDER_PATH);

(async function up() {
  console.log("Creating DB ...")
  const database = new Database();

  console.log("Connecting DB ...")
  await database.connect();

  await migration();

  await database.disconnect();
} )();

async function migration() {
  // Get Old data
  console.log("Getting old data ...")
  const oldEpisodeFileInfos: OldEpisodeFileInfoDocOdm[] = await OldEpisodeFileInfoModelOdm.find();
  const oldEpisodes: OldEpisodeDocOdm[] = await OldEpisodeModelOdm.find();
  const oldMusics: OldMusicDocOdm[] = await OldMusicModelOdm.find();

  // Transform and insert new data
  const newEpisodeFileInfosDocs: EpisodeFileInfoOdm.Doc[] = [];
  const newEpisodesDocs: EpisodeOdm.Doc[] = [];
  const newMusicsDocs: MusicDocOdm[] = [];
  const newMusicFileInfosDocs: MusicFileInfoDocOdm[] = [];

  console.log("Creating new episodes ...");
  for (const o of oldEpisodes) {
    const e: Record<keyof EpisodeOdm.Doc, any> = {
      _id: o._id,
      episodeId: o.episodeId,
      serieId: o.serieId,
      tags:o.tags,
      timestamps: o.timestamps,
      title: o.title,
      weight: o.weight,
      lastTimePlayed: o.lastTimePlayed,
      disabled: o.disabled,
    }

    newEpisodesDocs.push(e);
  }

  console.log("Putting new episode file infos ...");
  await EpisodeOdm.Model.deleteMany();
  await EpisodeOdm.Model.insertMany(newEpisodesDocs);

  console.log("Creating new episode file infos ...");
  let n = 0;
  for (const oldEpisodeFileInfo of oldEpisodeFileInfos) {
    console.log(n++ + " / " + oldEpisodeFileInfos.length);
    const episode = oldEpisodes.find(e=>oldEpisodeFileInfo.episodeId.toString() === e._id.toString());
    assertIsDefined(episode, "Not found: "+ oldEpisodeFileInfo.episodeId + " " + oldEpisodeFileInfo.path);
    const e: Record<keyof EpisodeFileInfoOdm.Doc, any> = {
      _id: oldEpisodeFileInfo._id,
      episodeId: oldEpisodeFileInfo.episodeId,
      start: episode?.start,
      end: episode?.end,
      hash: oldEpisodeFileInfo.hash,
      mediaInfo: oldEpisodeFileInfo.mediaInfo,
      path: episode?.path,
      size: oldEpisodeFileInfo.size,
      timestamps: oldEpisodeFileInfo.timestamps,
    }

    newEpisodeFileInfosDocs.push(e);
  }
console.log("Putting new episode file infos ...");
    await EpisodeFileInfoOdm.Model.deleteMany();
    await EpisodeFileInfoOdm.Model.insertMany(newEpisodeFileInfosDocs);

    console.log("Creating new musics and file infos ...");
    const sizeMusics = oldMusics.length;
    let i = 1;
  for (const o of oldMusics) {
    const e: Record<keyof MusicDocOdm, any> = {
      _id: o._id,
      onlyTags: o.onlyTags,
      album: o.album,
      artist: o.artist,
      country: o.country,
      disabled: o.disabled,
      game: o.game,
      lastTimePlayed: o.lastTimePlayed,
      tags: o.tags,
      spotifyId: o.spotifyId,
      timestamps: o.timestamps,
      title: o.title,
      url: o.url,
      weight: o.weight,
      year: o.year,
    };

    newMusicsDocs.push(e);

    console.log(i++ + " / " + sizeMusics);
    assert(o.path !== undefined, JSON.stringify(o, null, 2));
    const {ctime, mtime} = statSync(ENVS.MEDIA_FOLDER_PATH + "/music/data/" + o.path);

    const e2: Record<keyof Omit<MusicFileInfoDocOdm, "_id">, any> = {
      hash: o.hash,
      mediaInfo: {
        duration: o.mediaInfo.duration,
      },
      musicId: o._id,
      path: o.path,
      size: o.size,
      timestamps: {
        createdAt: new Date(ctime),
        updatedAt: new Date(mtime),
      }
    };

    newMusicFileInfosDocs.push(e2);
  }

  console.log("Putting new musics and file infos ...");

    await MusicModelOdm.deleteMany();
    await MusicModelOdm.insertMany(newMusicsDocs);


    await MusicFileInfoModelOdm.deleteMany();
    await MusicFileInfoModelOdm.insertMany(newMusicFileInfosDocs);

    // Tests

    console.log("Doing tests ...");

    {
      console.log("Test: Episodes");
      const old = oldEpisodes;
    const inserted = await EpisodeOdm.Model.find();
    assert(inserted.length === old.length, `Inserted: ${inserted.length}. OldCount: ${old.length}`);

    for (const n of inserted)
      assertIsEpisodeEntity(EpisodeOdm.docToEntity(n));

    let i = 1;
    for (const o of old) {
      console.log(i++ + " / " + old.length);
      const found = inserted.find(e=>o._id.toString() === e._id.toString());

      if (!found)
        throw new Error("Not found old _id " + o._id);
    }
  }

  {
     console.log("Test: Episode File Infos");
    const inserted = await EpisodeFileInfoOdm.Model.find();
    const old = oldEpisodeFileInfos;
    assert(inserted.length === old.length, `Inserted: ${inserted.length}. OldCount: ${old.length}`);

    for (const n of inserted)
      assertIsEpisodeFileInfoEntity(EpisodeFileInfoOdm.docToEntity(n));

    let i = 1;
    for (const o of old) {
      console.log(i++ + " / " + old.length);
      const found = inserted.find(e=>o._id.toString() === e._id.toString());

      if (!found)
        throw new Error("Not found old _id " + o._id);
    }

  }

   {
     console.log("Test: Musics");
    const inserted = await MusicModelOdm.find();
    const old = oldMusics;
    assert(inserted.length === old.length, `Inserted: ${inserted.length}. OldCount: ${old.length}`);

    for (const n of inserted)
      assertIsMusicEntity(musicDocOdmToEntity(n));

    let i = 1;
    for (const o of old) {
      console.log(i++ + " / " + old.length);
      const found = inserted.find(e=>o._id.toString() === e._id.toString());

      if (!found)
        throw new Error("Not found old _id " + o._id);
    }

  }

   {
     console.log("Test: Music File Infos");
    const inserted = await MusicFileInfoModelOdm.find();
    const old = oldMusics;
    assert(inserted.length === old.length, `Inserted: ${inserted.length}. OldCount: ${old.length}`);

    for (const n of inserted)
      assertIsMusicFileInfoEntity(musicFileInfoDocOdmToEntity(n));

    let i = 1;
    for (const o of old) {
      console.log(i++ + " / " + old.length);
      const found = inserted.find(e=>o._id.toString() === e.musicId.toString());

      if (!found)
        throw new Error("Not found old _id " + o._id);
    }

  }


    console.log("Tests completed!")
}