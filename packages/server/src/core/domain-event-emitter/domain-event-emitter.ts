import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DomainEvent, Entity, EntityEvent, PatchEvent } from "./events";

type Consumer<P> = (event: DomainEvent<P>)=> Promise<void>;

type EmitPatchProps = {
  entity: object;
  id: unknown;
  unset?: (number | string)[][];
};
@Injectable()
export class DomainEventEmitter {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {
  }

  emit<P>(queueKey: string, payload: P): void {
    const event: DomainEvent<P> = {
      type: queueKey,
      payload,
    };

    this.publish(event);
  }

  emitEntity<O extends Entity<ID>, ID extends unknown>(queueKey: string, entity: O) {
    const payload = {
      entity,
    } as EntityEvent<O>["payload"];

    this.emit(queueKey, payload);
  }

  emitPatch<O extends object, ID>(queueKey: string, { entity, id, unset }: EmitPatchProps) {
    for (const [key, value] of Object.entries(entity)) {
      const payload = {
        entityId: id,
        key: key as keyof O,
        value,
      } as PatchEvent<O, ID>["payload"];

      this.emit(queueKey, payload);
    }

    if (unset) {
      for (const p of unset) {
        const payload = {
          entityId: id,
          key: p.join("."),
          value: undefined,
        } as PatchEvent<O, ID>["payload"];

        this.emit(queueKey, payload);
      }
    }
  }

  publish<P>(event: DomainEvent<P>): void {
    this.eventEmitter.emit(event.type, event);
  }

  subscribe<P>(queueKey: string, callback: Consumer<P>): void {
    this.eventEmitter.on(queueKey, callback);
  }
}
