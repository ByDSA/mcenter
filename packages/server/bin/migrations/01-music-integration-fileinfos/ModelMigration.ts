import { Model } from "mongoose";
import assert from "node:assert";

const DefaultModelMigrationParams = {
  old: {
    backup: true,
  },
};

/* eslint-disable import/prefer-default-export */
type ModelMigrationParams<OldDocOdm extends Object, NewDocOdm extends Object> = {
  new: {
    model: Model<NewDocOdm>;
  };
  old: {
    schemaOdm: any;
    backup?: boolean;
  };
};
export abstract class ModelMigration<OldDocOdm extends Object, NewDocOdm extends Object> {
  protected params: ModelMigrationParams<OldDocOdm, NewDocOdm>;

  protected oldModelOdm: Model<OldDocOdm>;

  protected typeName: string;

  #oldDocs!: OldDocOdm[];

  protected backup?: {
    collectionName: string;
    modelOdm: Model<OldDocOdm>;
  };

  constructor(params: ModelMigrationParams<OldDocOdm, NewDocOdm>) {
    this.params = {
      new: {
        model: params.new.model,
      },
      old: {
        schemaOdm: params.old.schemaOdm,
        backup: params.old.backup ?? DefaultModelMigrationParams.old.backup,
      },
    };
    const {new: {model: newModel}, old: {schemaOdm: oldSchemaOdm}} = this.params;

    this.typeName = newModel.collection.collectionName;
    this.oldModelOdm = newModel.db.model<OldDocOdm>(`${this.typeName}`, oldSchemaOdm);

    if (params.old.backup) {
      const backupCollectionName = `${this.typeName}Backup`;
      const BackupOldModelOdm = this.oldModelOdm.db.model<OldDocOdm>(backupCollectionName, this.oldModelOdm.schema, backupCollectionName);

      this.backup = {
        collectionName: backupCollectionName,
        modelOdm: BackupOldModelOdm,
      };
    }
  }

  protected log(...msg: any[]) {
    // eslint-disable-next-line no-console
    console.log(`[${this.typeName}]`, ...msg);
  }

  async #fetchOldDocs() {
    this.log("Fetching old docs ...");
    this.#oldDocs = await this.oldModelOdm.find();

    // Checking _id
    for (const oldDoc of this.#oldDocs) {
      if (!("_id" in oldDoc))
        throw new Error("old._id is undefined");
    }

    this.log("Got old docs:", this.#oldDocs.length);
  }

  async #backupOldCollection() {
    this.log("Backing up old collection ...");
    assert(this.backup);

    await this.backup.modelOdm.collection.drop();

    await this.backup.modelOdm.insertMany(this.#oldDocs);

    this.log("Old collection backed up");
  }

  async #emptyingNewCollection() {
    this.log("Emptying new collection ...");
    await this.params.new.model.deleteMany();
  }

  // eslint-disable-next-line class-methods-use-this
  async #addNewDocsToNewCollection(newDocs: NewDocOdm[]) {
    this.log("Adding new docs ...");
    const promises = [];

    for (const newDoc of newDocs) {
      if (!("_id" in newDoc))
        throw new Error("new._id is undefined");

      const p = this.params.new.model.create(newDoc).catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error adding new doc:", err, JSON.stringify(newDoc));
        throw err;
      } );

      promises.push(p);
    }

    const addedNewDocs = await Promise.all(promises);

    this.log("Inserted docs:", addedNewDocs.length);
  }

  abstract adaptOldDocsAndGet(oldDocs: OldDocOdm[]): Promise<NewDocOdm[]>;

  protected afterTests?: (newDocs: NewDocOdm[])=> Promise<void>;

  async up() {
    this.log("Starting migration");

    await this.#fetchOldDocs();

    if (this.backup)
      await this.#backupOldCollection();

    this.log("Adapting old docs ...");
    const newDocs = await this.adaptOldDocsAndGet(this.#oldDocs);

    await this.#emptyingNewCollection();

    await this.#addNewDocsToNewCollection(newDocs);

    this.log("Finding new docs ...");
    const foundNewDocs = await this.params.new.model.find();

    this.log("Got new docs from new db:", foundNewDocs.length);

    if (this.afterTests) {
      await this.afterTests(foundNewDocs);
      this.log("After tests done");
    }

    if (this.backup) {
      this.log("Droping backup temporal collection ...");
      await this.backup.modelOdm.collection.drop();
    }

    this.log("Migration done!");
  }
}