import { PublicMethodsOf } from "#shared/utils/types";
import { FrontWebSocketsServerService } from "../front";

export default class WebSocketsServiceMock implements PublicMethodsOf<FrontWebSocketsServerService> {
  startSocket = jest.fn();
}