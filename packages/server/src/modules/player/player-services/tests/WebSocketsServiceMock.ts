import { FrontWebSocketsServerService } from "../front";
import { PublicMethodsOf } from "$shared/utils/types";

export class WebSocketsServiceMock
implements PublicMethodsOf<FrontWebSocketsServerService> {
  startSocket = jest.fn();
}
