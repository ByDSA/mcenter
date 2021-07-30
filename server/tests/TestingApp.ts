/* eslint-disable import/prefer-default-export */
import App from "../src/app";
import { Mock } from "./mocks";

export abstract class TestingApp extends App {
  private mocks: Mock[] = [];

  constructor() {
    super( {
      port: 8081 + Math.floor(Math.random() * 1000),
    } );
  }

  abstract createMocks(): Mock[];

  private async initializeMocks() {
    for (const m of this.mocks)
      // eslint-disable-next-line no-await-in-loop
      await m.initialize();
  }

  private clearMocks() {
    const promises = [];

    for (const m of this.mocks)
      promises.push(m.clear());

    return Promise.all(promises);
  }

  async run() {
    await super.run();

    this.mocks = this.createMocks();
    await this.initializeMocks();
  }

  async kill() {
    await this.clearMocks();

    return super.kill();
  }
}
