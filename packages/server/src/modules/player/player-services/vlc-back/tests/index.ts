import { getOrCreateMockProvider } from "#utils/nestjs/tests";
import { VlcBackWebSocketsServerService } from "..";

export const playerBackWebSocketsServiceMockProvider = getOrCreateMockProvider(
  VlcBackWebSocketsServerService,
);
