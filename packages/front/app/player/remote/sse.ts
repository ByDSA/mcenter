import { DisconnectionResponse, disconnectionResponseSchema, FromRemotePlayerEvent, InitialConnectionsResponse, initialConnectionsResponseSchema, NewConnectionResponse, newConnectionResponseSchema, OpenClosedResponse, openClosedResponseSchema } from "$shared/models/player";
import { logger } from "#modules/core/logger";

type Props = {
  url: string;
  onNewConnection: (connection: NewConnectionResponse)=> Promise<void>;
  onDisconnection: (disconnection: DisconnectionResponse)=> Promise<void>;
  onInitial: (initialConnections: InitialConnectionsResponse)=> Promise<void>;
  onOpenClosed: (openClosedResponse: OpenClosedResponse)=> Promise<void>;
  onErrorConnecting: ()=> Promise<void>;
  onUnauthorized: ()=> Promise<void>;
};

export function sseRemotePlayers( { url,
  onNewConnection,
  onDisconnection,
  onErrorConnecting,
  onOpenClosed,
  onUnauthorized,
  onInitial }: Props) {
  const eventSource = new EventSource(url, {
    withCredentials: true,
  } );

  eventSource.onmessage = async (event: MessageEvent) => {
    try {
      const parsedData = JSON.parse(event.data);

      logger.debug("Received data: " + JSON.stringify(parsedData, null, 2));

      if (parsedData.type === "initial") {
        logger.info("Connected to server.");
        await onInitial(initialConnectionsResponseSchema.parse(parsedData.data));
      } else if (parsedData.type === FromRemotePlayerEvent.CONNECTION)
        await onNewConnection(newConnectionResponseSchema.parse(parsedData.data));
      else if (parsedData.type === FromRemotePlayerEvent.DISCONNECT)
        await onDisconnection(disconnectionResponseSchema.parse(parsedData.data));
      else if (parsedData.type === FromRemotePlayerEvent.OPEN_CLOSED)
        await onOpenClosed(openClosedResponseSchema.parse(parsedData.data));
    } catch (error) {
      logger.error("Error parsing SSE data:", error);
    }
  };

  eventSource.onerror = async (event) => {
    if ("data" in event && typeof event.data === "string" && event.data.includes("Unauthorized"))
      await onUnauthorized();
    else if ((event.target as EventSource).readyState === 0)
      await onErrorConnecting();
  };

  return () => {
    eventSource.close();
    logger.debug("SSE connection closed");
  };
}
