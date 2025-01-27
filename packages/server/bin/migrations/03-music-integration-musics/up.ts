/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import { statSync } from "fs";
import { RealDatabase as Database } from "../../../src/main/db/Database";
import { ModelMigration } from "../01-music-integration-fileinfos/ModelMigration";
import { md5HashOfFile } from "../01-music-integration-fileinfos/utils";
import { assertIsModel as assertIsMusic } from "./new/Music/Music";
import { docOdmToModel } from "./new/Music/adapters";
import { DocOdm as MusicNewDocOdm, ModelOdm as MusicNewModelOdm } from "./new/Music/odm";
import { DocOdm as MusicOldDocOdm, SchemaOdm as MusicOldSchemaOdm } from "./old/Music/odm";

type OldDocOdm = MusicOldDocOdm;
type NewDocOdm = MusicNewDocOdm;

const ENVS = {
  MEDIA_FOLDER_PATH: process.env.MEDIA_FOLDER_PATH as string,
};

if (!ENVS.MEDIA_FOLDER_PATH)
  throw new Error("process.env.MEDIA_FOLDER_PATH is undefined");
else
  console.log("process.env.MEDIA_PATH:", ENVS.MEDIA_FOLDER_PATH);

(async function up() {
  const database = new Database();

  database.init();

  await database.connect();

  await migration();

  await database.disconnect();
} )();

async function migration() {
  await new MusicMigration( {
    new: {
      model: MusicNewModelOdm,
    },
    old: {
      schemaOdm: MusicOldSchemaOdm,
      backup: true,
    },
  } ).up();
}

class MusicMigration extends ModelMigration<OldDocOdm, NewDocOdm> {
  // eslint-disable-next-line require-await, class-methods-use-this
  async adaptOldDocsAndGet(oldDocs: OldDocOdm[]): Promise<NewDocOdm[]> {
    const news: Promise<NewDocOdm>[] = oldDocs.map(async (doc: OldDocOdm) => {
      const artist = doc.artist || "undefined";
      const fullPath = `${ENVS.MEDIA_FOLDER_PATH}/music/data/${doc.path}`;
      let {weight} = doc;

      if (weight === undefined)
        weight = 0;
      else if (typeof weight !== "string")
        weight = +weight;

      if (Number.isNaN(weight))
        throw new Error(`weight is NaN: ${weight}`);

      const mediaInfo = {
        duration: null,
      };
      let {hash} = doc;

      if (!hash || hash.length !== 32)
        hash = await md5HashOfFile(fullPath);

      let {timestamps, size} = doc;

      if (!timestamps || !timestamps.createdAt || !timestamps.updatedAt || !size) {
        const {mtime, ctime, size: statSize} = statSync(fullPath);

        if (!timestamps || !timestamps.createdAt || !timestamps.updatedAt) {
          timestamps = {
            createdAt: ctime,
            updatedAt: mtime,
          };
        }

        if (!size)
          size = statSize;
      }

      const ret: NewDocOdm = {
        _id: doc._id,
        artist,
        url: doc.url,
        path: doc.path,
        title: doc.title,
        weight,
        size,
        hash,
        mediaInfo,
        timestamps,
        album: doc.album,
        disabled: doc.disabled,
        lastTimePlayed: doc.lastTimePlayed,
        tags: doc.tags,
        country: doc.country,
        game: doc.game,
        todo: doc.todo,
        year: doc.year,
      };

      return ret;
    },
    );

    return Promise.all(news);
  }

  // eslint-disable-next-line require-await, class-methods-use-this
  afterTests = async (newDocs: NewDocOdm[]) => {
    for (const docOdm of newDocs) {
      try {
        const model = docOdmToModel(docOdm);

        assertIsMusic(model);
      } catch (err) {
        console.log("Test failed!");
        console.log("docOdm:", docOdm);
        throw err;
      }
    }
  };
}