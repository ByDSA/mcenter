import { PublicMethodsOf } from "#shared/utils/types";
import { VlcBackWebSocketsServerService } from "..";

export default class PlayerBackWebSocketsServiceMock implements PublicMethodsOf<VlcBackWebSocketsServerService> {
  #startSocket = jest.fn();

  pauseToggle = jest.fn();

  next = jest.fn();

  previous = jest.fn();

  stop = jest.fn();

  seek = jest.fn();

  fullscreenToggle = jest.fn();

  play = jest.fn();

  playResource = jest.fn();

  getLastStatus = jest.fn();

  setHttpServer = jest.fn();
}