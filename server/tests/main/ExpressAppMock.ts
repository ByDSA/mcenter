import { ExpressApp } from "#main";
import { ExpressAppDependencies } from "#main/ExpressApp";
import { ActionControllerMock } from "#modules/actions/test";
import { HistoryListRestControllerMock } from "#modules/historyLists/controllers/test";
import { PickerControllerMock } from "#modules/picker/tests";
import { PlaySerieControllerMock, PlayStreamControllerMock } from "#modules/play/tests";
import { deepMerge } from "#utils/objects";
import { TestMongoDatabase } from "./db";
import TestDatabase from "./db/TestDatabase";

export default class ExpressAppMock extends ExpressApp {
  #database: TestDatabase;

  constructor(dependencies: Partial<ExpressAppDependencies>) {
    const defaultDependencies: ExpressAppDependencies = {
      db: {
        instance: new TestMongoDatabase(),
      },
      play: {
        playSerieController: new PlaySerieControllerMock(),
        playStreamController: new PlayStreamControllerMock(),
      },
      pickerController: new PickerControllerMock(),
      actionController: new ActionControllerMock(),
      historyList: {
        restController: new HistoryListRestControllerMock(),
      },
    };
    const actualDependencies: ExpressAppDependencies = deepMerge(defaultDependencies, dependencies) as ExpressAppDependencies;

    super(actualDependencies);
    this.#database = actualDependencies.db.instance as TestDatabase;
  }

  async dropDb() {
    await this.#database.drop();
  }
}