import { DisconnectionResponse, NewConnectionResponse } from "$shared/models/player";
import { OpenClosedResponse } from "$shared/models/player";
import { FromRemotePlayerEvent, ToRemotePlayerEvent } from "./models";

export namespace ToRemotePlayerEvents {
  export const WILDCARD = `${ToRemotePlayerEvent.MAIN_TYPE}.*`;

  export const getEventEmitterType = (
    type: ToRemotePlayerEvent,
  ) => `${ToRemotePlayerEvent.MAIN_TYPE}.${type}`;

  export namespace Play {
    export const TYPE = getEventEmitterType(ToRemotePlayerEvent.PLAY);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = {
      id: number;
      remotePlayerId: string;
    };

    export const create = (id: Payload["id"], remotePlayerId: string): Event =>{
      return {
        type: TYPE,
        payload: {
          id,
          remotePlayerId,
        },
      };
    };
  }

  export namespace Seek {
    export const TYPE = getEventEmitterType(ToRemotePlayerEvent.SEEK);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = {
      value: number | string;
      remotePlayerId: string;
    };

    export const create = (value: Payload["value"], remotePlayerId: string): Event => {
      return {
        type: TYPE,
        payload: {
          value,
          remotePlayerId,
        },
      };
    };
  }

  export namespace Empty {
    export type Event = {
      type: string;
      payload: {
        remotePlayerId: string;
      };
    };

    export const create = (type: string, remotePlayerId: string): Event => {
      return {
        type: ToRemotePlayerEvent.MAIN_TYPE + "." + type,
        payload: {
          remotePlayerId,
        },
      };
    };
  }
}

export namespace FromRemotePlayerEvents {
  const { MAIN_TYPE } = FromRemotePlayerEvent;
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export const getEventEmitterType = (type: FromRemotePlayerEvent) => `${MAIN_TYPE}.${type}`;

  export namespace Status {
    export const TYPE = getEventEmitterType(FromRemotePlayerEvent.STATUS);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = {
      status: any; // Define a more specific type if possible
      remotePlayerId: string;
    };

    export const create = (status: Payload["status"], remotePlayerId: string): Event => {
      return {
        type: TYPE,
        payload: {
          status,
          remotePlayerId,
        },
      };
    };
  }

  export namespace Connection {
    export const TYPE = getEventEmitterType(FromRemotePlayerEvent.CONNECTION);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = NewConnectionResponse;

    export const create = (payload: Payload): Event => {
      return {
        type: TYPE,
        payload,
      };
    };
  }

  export namespace Disconnect {
    export const TYPE = getEventEmitterType(FromRemotePlayerEvent.DISCONNECT);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = DisconnectionResponse;

    export const create = (payload: Payload): Event => {
      return {
        type: TYPE,
        payload,
      };
    };
  }

  export namespace OpenClosed {
    export const TYPE = getEventEmitterType(FromRemotePlayerEvent.OPEN_CLOSED);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = OpenClosedResponse;

    export const create = (payload: Payload): Event => {
      return {
        type: TYPE,
        payload,
      };
    };
  }
}
