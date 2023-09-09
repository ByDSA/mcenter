import { ExpressApp } from "#main";
import { ExpressAppDependencies } from "#main/ExpressApp";
import { ActionControllerMock } from "#modules/actions/test";
import { EpisodeRestControllerMock } from "#modules/episodes/controllers/test";
import { HistoryListRestControllerMock } from "#modules/historyLists/controllers/test";
import { PickerControllerMock } from "#modules/picker/tests";
import { PlaySerieControllerMock, PlayStreamControllerMock } from "#modules/play/tests";
import { deepMerge } from "#shared/utils/objects";
import { TestMongoDatabase } from "./db";
import TestDatabase from "./db/TestDatabase";

export default class ExpressAppMock extends ExpressApp {
  #database: TestDatabase;

  constructor(dependencies: {} = {
  } ) {
    const defaultRequiredDependencies: ExpressAppDependencies = {
      db: {
        instance: new TestMongoDatabase(),
      },
      modules: {
        play: {
          playSerieController: new PlaySerieControllerMock(),
          playStreamController: new PlayStreamControllerMock(),
        },
        picker: {
          controller: new PickerControllerMock(),
        },
        actionController: new ActionControllerMock(),
        historyList: {
          restController: new HistoryListRestControllerMock(),
        },
        episodes: {
          restController: new EpisodeRestControllerMock(),
        },
      },
      controllers: {
      },
    };
    const actualDependencies: ExpressAppDependencies = deepMerge(defaultRequiredDependencies, dependencies) as ExpressAppDependencies;

    super(actualDependencies);
    this.#database = actualDependencies.db.instance as TestDatabase;
  }

  async dropDb() {
    await this.#database.drop();
  }
}