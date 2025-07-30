import { PlayerEvent } from "./models";

export namespace PlayerEvents {
  const MAIN_TYPE = "player";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export const getEventEmitterType = (type: PlayerEvent) => `${MAIN_TYPE}.${type}`;

  export namespace Play {
    export const TYPE = getEventEmitterType(PlayerEvent.PLAY);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = {
      id: number;
    };

    export const create = (id: Payload["id"]): Event =>{
      return {
        type: TYPE,
        payload: {
          id,
        },
      };
    };
  }

  export namespace Status {
    export const TYPE = getEventEmitterType(PlayerEvent.STATUS);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = {
      status: any; // Define a more specific type if possible
    };

    export const create = (status: Payload["status"]): Event => {
      return {
        type: TYPE,
        payload: {
          status,
        },
      };
    };
  }

  export namespace Seek {
    export const TYPE = getEventEmitterType(PlayerEvent.SEEK);
    export type Event = {
      type: string;
      payload: Payload;
    };
    export type Payload = {
      value: number | string;
    };

    export const create = (value: Payload["value"]): Event => {
      return {
        type: TYPE,
        payload: {
          value,
        },
      };
    };
  }

  export namespace Empty {
    export type Event = {
      type: string;
      payload: null;
    };

    export const create = (type: string): Event => {
      return {
        type: MAIN_TYPE + "." + type,
        payload: null,
      };
    };
  }
}
