import { QUEUE_NAME } from "#modules/episodes/repositories";
import { ModelEvent, ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { Event } from "#utils/message-broker";

export function logDomainEvent<M extends Object>(event: Event<ModelMessage<M>>) {
  if (event instanceof ModelEvent)
    console.log(`[${QUEUE_NAME}]`, event.type, event.payload.entity);
  else if (event instanceof PatchEvent) {
    const key = event.payload.key.toString();

    console.log(`[${QUEUE_NAME}]`, event.type, event.payload.entityId, `${key}:`, event.payload.value);
  } else
    throw new Error("Unknown event type");
}