import { PublicMethodsOf } from "$shared/utils/types";
import { FrontWebSocketsServerService } from "../front";

export class WebSocketsServiceMock
implements PublicMethodsOf<FrontWebSocketsServerService> {
  startSocket = jest.fn();
}
