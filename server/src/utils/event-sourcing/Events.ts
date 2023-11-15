/* eslint-disable max-classes-per-file */
import { Event } from "#utils/message-broker";
import EventType from "./EventType";
import ModelMessage from "./ModelMessage";
import PatchModelMessage from "./PatchModelMessage";

type ModelEventType = EventType.CREATED | EventType.DELETED | EventType.UPDATED;

export class ModelEvent<M extends Object> implements Event<ModelMessage<M>> {
  readonly type: ModelEventType;

  readonly payload: ModelMessage<M>;

  constructor(type: ModelEventType, payload: ModelMessage<M>) {
    this.type = type;
    this.payload = payload;
  }
}

export class PatchEvent<M extends Object, ID extends Object> implements Event<PatchModelMessage<M, ID>> {
  readonly type: EventType.PATCHED;

  readonly payload: PatchModelMessage<M, ID>;

  constructor(payload: PatchModelMessage<M, ID>) {
    this.type = EventType.PATCHED;
    this.payload = payload;
  }
}
