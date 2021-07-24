/* eslint-disable import/prefer-default-export */
import App from "../src/app";
import { Mock } from "./mocks";

export abstract class TestingApp extends App {
  private mocks: Mock[] = [];

  abstract createMocks(): Mock[];

  private initializeMocks() {
    const promises = [];

    for (const m of this.mocks)
      promises.push(m.initialize());

    return Promise.all(promises);
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
