import { createMockProvider } from "#utils/nestjs/tests";
import { VlcBackWebSocketsServerService } from "..";

export const playerBackWebSocketsServiceMockProvider = createMockProvider(
  VlcBackWebSocketsServerService,
);
