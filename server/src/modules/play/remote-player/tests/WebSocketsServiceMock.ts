import { PublicMethodsOf } from "#shared/utils/types";
import WebSocketsService from "../WebSocketsService";

export default class WebSocketsServiceMock implements PublicMethodsOf<WebSocketsService> {
  onPauseToggle = jest.fn();

  onNext = jest.fn();

  onPrevious = jest.fn();

  onStop = jest.fn();

  onPlay = jest.fn();

  onSeek = jest.fn();

  startSocket = jest.fn();

  emitStatus = jest.fn();
}