/* eslint-disable import/prefer-default-export */
import { clearMock, initializeMock } from "../db/models/music/music.mock";
import App from "./app";

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
