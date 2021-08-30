/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */
import { GroupMock1, Mock, MusicMock1, SerieMock1, UserMock1, VideoMock1 } from "./mocks";
import { TestingApp } from "./TestingApp";

export class TestingApp1 extends TestingApp {
  createMocks(): Mock[] {
    const musicMock = new MusicMock1();
    const userMock = new UserMock1();
    const videoMock = new VideoMock1();
    const serieMock = new SerieMock1();
    const groupMock = new GroupMock1();

    return [musicMock, videoMock, serieMock, groupMock, userMock];
  }
}
