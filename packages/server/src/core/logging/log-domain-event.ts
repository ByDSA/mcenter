import { Logger } from "@nestjs/common";
import { DomainEvent, Entity, EntityEvent, PatchEvent } from "#core/domain-event-emitter";

export function logDomainEvent(
  event: DomainEvent<unknown>,
) {
  const queueKey = event.type;
  const logger = new Logger();

  if (isEntityEvent(event))
    logger.log(`[${queueKey}] ${event.type} ${event.payload.entity}`);
  else if (isPatchEvent(event)) {
    const key = (event.payload.key as any).toString();
    const { value } = event.payload;
    const showedValue = typeof value === "string" ? `'${ value }'` : value;

    logger.log(`[${queueKey}] ${event.type} ${event.payload.entityId} ${key}: ${showedValue}`);
  } else
    throw new Error("Unknown event type: " + event.type);
}

function isEntityEvent<M extends Entity<any>>(event: DomainEvent<any>): event is EntityEvent<M> {
  return "entity" in event.payload;
}
function isPatchEvent<M extends object>(
  event: DomainEvent<any>,
): event is PatchEvent<M, unknown> {
  return "entityId" in event.payload;
}
