/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import fs from "node:fs";
import { join } from "node:path";
import Database from "../../../src/main/db/Database";
import { ModelMigration } from "./ModelMigration";
import { assertIsModel as assertIsFileInfo } from "./new/FileInfo/FileInfoVideo";
import { docOdmToModel as fileInfoOdmToModel } from "./new/FileInfo/adapters";
import { DocOdm as FileInfoNewDocOdm, ModelOdm as FileInfoNewModelOdm } from "./new/FileInfo/odm";
import { DocOdm as FileInfoOldDocOdm, SchemaOdm as FileInfoOldSchemaOdm } from "./old/FileInfo/odm";
import { md5HashOfFile } from "./utils";

const ENVS = {
  MEDIA_FOLDER_PATH: process.env.MEDIA_FOLDER_PATH as string,
};

(async function up() {
  if (!ENVS.MEDIA_FOLDER_PATH)
    throw new Error("process.env.MEDIA_FOLDER_PATH is undefined");
  else
    console.log("process.env.MEDIA_FOLDER_PATH:", ENVS.MEDIA_FOLDER_PATH);

  const database = new Database();

  database.init();

  await database.connect();

  await fileInfoMigration();

  await database.disconnect();
} )();

class FileInfoMigration extends ModelMigration<FileInfoOldDocOdm, FileInfoNewDocOdm> {
  // eslint-disable-next-line require-await, class-methods-use-this
  async adaptOldDocsAndGet(oldDocs: FileInfoOldDocOdm[]) {
    const fileInfosNewToSavePromises: Promise<FileInfoNewDocOdm>[] = oldDocs.map(async (doc: FileInfoOldDocOdm) => {
      const fullPath = join(ENVS.MEDIA_FOLDER_PATH, doc.path);
      const stats = fs.statSync(fullPath);
      let {hash} = doc;

      if (!hash)
        hash = await md5HashOfFile(fullPath);

      let {size} = doc;

      if (!size)
        size = stats.size;

      const createdAt = doc.timestamps?.createdAt ?? stats.ctime;
      const updatedAt = doc.timestamps?.updatedAt ?? stats.mtime;
      const ret: FileInfoNewDocOdm = {
        _id: doc._id,
        episodeId: doc.episodeId,
        path: doc.path,
        hash,
        size,
        timestamps: {
          createdAt,
          updatedAt,
        },
        mediaInfo: {
          duration: doc.mediaInfo.duration,
          resolution: {
            width: doc.mediaInfo.resolution.width,
            height: doc.mediaInfo.resolution.height,
          },
          fps: doc.mediaInfo.fps,
        },
      };

      return ret;
    },
    );

    return Promise.all(fileInfosNewToSavePromises);
  }

  // eslint-disable-next-line require-await, class-methods-use-this
  afterTests = async (newDocs: FileInfoNewDocOdm[]) => {
    for (const docOdm of newDocs) {
      const model = fileInfoOdmToModel(docOdm);

      try {
        assertIsFileInfo(model);
      } catch (err) {
        console.log("Test failed!");
        console.log("docOdm:", docOdm);
        console.log("model:", model);
        throw err;
      }
    }

    ;
  };
}

async function fileInfoMigration() {
  await new FileInfoMigration( {
    new: {
      model: FileInfoNewModelOdm,
    },
    old: {
      schemaOdm: FileInfoOldSchemaOdm,
      backup: true,
    },
  } ).up();
}
