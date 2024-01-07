import { PublicMethodsOf } from "#shared/utils/types";
import { VlcBackWebSocketsServerService } from "..";

export default class PlayerBackWebSocketsServiceMock implements PublicMethodsOf<VlcBackWebSocketsServerService> {
  startSocket = jest.fn();

  emitPlayResource = jest.fn();
}