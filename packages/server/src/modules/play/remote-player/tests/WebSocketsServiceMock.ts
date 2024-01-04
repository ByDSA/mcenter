import { PublicMethodsOf } from "#shared/utils/types";
import WebSocketsFrontServerService from "../RemoteFrontPlayerWebSocketsServerService";

export default class WebSocketsServiceMock implements PublicMethodsOf<WebSocketsFrontServerService> {
  onPauseToggle = jest.fn();

  onNext = jest.fn();

  onPrevious = jest.fn();

  onStop = jest.fn();

  onPlay = jest.fn();

  onSeek = jest.fn();

  #startSocket = jest.fn();

  emitStatus = jest.fn();

  onFullscreenToggle = jest.fn();

  setHttpServer = jest.fn();
}