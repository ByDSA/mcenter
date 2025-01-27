import { PlayerEvent as PlayerEventType } from "#modules/play/player-services/models";
import { Event } from "#utils/message-broker";

export const QUEUE_NAME = "player";
type PLAY_PAYLOAD = {
  id: number;
};
export class PlayPlayerEvent implements Event<PLAY_PAYLOAD> {
  readonly type = PlayerEventType.PLAY;

  readonly payload: PLAY_PAYLOAD;

  constructor(id: PLAY_PAYLOAD["id"]) {
    this.payload = {
      id,
    };
  }
}
type STATUS_PAYLOAD = {
  status: any;
};
export class StatusPlayerEvent implements Event<STATUS_PAYLOAD> {
  readonly type = PlayerEventType.STATUS;

  readonly payload: STATUS_PAYLOAD;

  constructor(status: STATUS_PAYLOAD["status"]) {
    this.payload = {
      status,
    };
  }
}
type SEEK_PAYLOAD = {
  value: number | string;
};
export class SeekPlayerEvent implements Event<SEEK_PAYLOAD> {
  readonly type = PlayerEventType.SEEK;

  readonly payload: SEEK_PAYLOAD;

  constructor(value: SEEK_PAYLOAD["value"]) {
    this.payload = {
      value,
    };
  }
}

export class EmptyPlayerEvent implements Event<null> {
  readonly payload: null = null;

  constructor(public readonly type: string) {
  }
}
