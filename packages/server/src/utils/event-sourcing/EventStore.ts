import { BrokerEvent } from "../message-broker/Event";
import { Message } from "./Message";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type EventStore<M extends Message, E extends BrokerEvent<M>> = object;

export interface CanCreateOne<M extends Message, E extends BrokerEvent<M>> {
  createOne(event: E): Promise<void>;
}

export interface CanUpdateOne<M extends Message, E extends BrokerEvent<M>> {
  updateOne(event: E): Promise<void>;
}

export interface CanDeleteOne<M extends Message, E extends BrokerEvent<M>> {
  deleteOne(event: E): Promise<void>;
}

export interface CanPatchOne<M extends Message, E extends BrokerEvent<M>> {
  patchOne(event: E): Promise<void>;
}

export interface CanPatchOneAndGet<M extends Message, E extends BrokerEvent<M>, RET> {
  patchOneAndGet(event: E): Promise<RET>;
}

export interface FullEventStore<M extends Message, E extends BrokerEvent<M>>
extends EventStore<M, E>,
CanCreateOne<M, E>,
CanUpdateOne<M, E>,
CanDeleteOne<M, E>,
CanPatchOne<M, E> {
}
