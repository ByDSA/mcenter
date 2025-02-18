/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
import { RealDatabase as Database } from "../../../src/main/db/Database";
import { ModelMigration } from "../01-music-integration-fileinfos/ModelMigration";
import { assertIsModel as assertIsEpisode } from "./new/Episode";
import { docOdmToModel as episodeOdmToModel } from "./new/adapters";
import { DocOdm as EpisodeNewDocOdm, ModelOdm as EpisodeNewModelOdm } from "./new/odm";
import { DocOdm as EpisodeOldDocOdm, SchemaOdm as EpisodeOldSchemaOdm } from "./old/odm";

type OldDocOdm = EpisodeOldDocOdm;
type NewDocOdm = EpisodeNewDocOdm;

(async function up() {
  const ENVS = {
    MEDIA_FOLDER_PATH: process.env.MEDIA_FOLDER_PATH as string,
  };

  if (!ENVS.MEDIA_FOLDER_PATH)
    throw new Error("process.env.MEDIA_FOLDER_PATH is undefined");
  else
    console.log("process.env.MEDIA_PATH:", ENVS.MEDIA_FOLDER_PATH);

  const database = new Database();

  database.init();

  await database.connect();

  await migration();

  await database.disconnect();
} )();

async function migration() {
  await new EpisodeMigration( {
    new: {
      model: EpisodeNewModelOdm,
    },
    old: {
      schemaOdm: EpisodeOldSchemaOdm,
      backup: true,
    },
  } ).up();
}

class EpisodeMigration extends ModelMigration<OldDocOdm, NewDocOdm> {
  // eslint-disable-next-line require-await, class-methods-use-this
  async adaptOldDocsAndGet(oldDocs: OldDocOdm[]): Promise<NewDocOdm[]> {
    const news: NewDocOdm[] = oldDocs.map((doc: OldDocOdm) => {
      const title = doc.title || `${doc.episodeId} ${doc.episodeId}`;
      const weight = doc.weight ?? 0;
      const start = !doc.start || doc.start <= 0 ? undefined : doc.start;
      const end = !doc.end || doc.end <= 0 ? undefined : doc.end;
      const ret: NewDocOdm = {
        _id: doc._id,
        episodeId: doc.episodeId,
        serieId: doc.serieId,
        path: doc.path,
        title,
        weight,
        disabled: doc.disabled,
        start,
        end,
        lastTimePlayed: doc.lastTimePlayed,
        tags: doc.tags,
      };

      return ret;
    },
    );

    return Promise.all(news);
  }

  // eslint-disable-next-line require-await, class-methods-use-this
  afterTests = async (newDocs: NewDocOdm[]) => {
    for (const docOdm of newDocs) {
      const model = episodeOdmToModel(docOdm);

      try {
        assertIsEpisode(model);
      } catch (err) {
        console.log("Test failed!");
        console.log("docOdm:", docOdm);
        console.log("model:", model);
        throw err;
      }
    }
  };
}