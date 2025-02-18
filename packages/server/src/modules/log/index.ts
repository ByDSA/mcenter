import { ModelEvent, ModelMessage, PatchEvent } from "#utils/event-sourcing";
import { Event } from "#utils/message-broker";

export function logDomainEvent<M extends object>(queueName: string, event: Event<ModelMessage<M>>) {
  if (event instanceof ModelEvent)
    console.log(`[${queueName}]`, event.type, event.payload.entity);
  else if (event instanceof PatchEvent) {
    const key = event.payload.key.toString();
    const { value } = event.payload;
    const showedValue = typeof value === "string" ? `'${ value }'` : value;

    console.log(`[${queueName}]`, event.type, event.payload.entityId, `${key}:`, showedValue);
  } else
    throw new Error("Unknown event type");
}
