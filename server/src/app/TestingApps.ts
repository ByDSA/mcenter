/* eslint-disable import/prefer-default-export */
import App from ".";
import { clearMock, initializeMock } from "../db/models/music/music.mock";

export class TestingApp1 extends App {
  async run() {
    await super.run();

    await clearMock();
    await initializeMock();
  }

  async kill() {
    await clearMock();

    return super.kill();
  }
}
