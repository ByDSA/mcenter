/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import { Mock, MusicMock1, UserMock1, VideoMock1 } from "./mocks";
import { TestingApp } from "./TestingApp";

export class TestingApp1 extends TestingApp {
  createMocks(): Mock[] {
    const musicMock = new MusicMock1();
    const userMock = new UserMock1();
    const videoMock = new VideoMock1();

    return [musicMock, userMock, videoMock];
  }
}
