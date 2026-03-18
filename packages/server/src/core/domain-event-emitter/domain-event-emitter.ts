import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DomainEvent, Entity, EntityEvent, PatchEvent } from "./events";

type Consumer<P> = (event: DomainEvent<P>)=> Promise<void>;

type EmitPatchProps<P, O> = {
  partialEntity: P;
  newEntity?: O;
  oldEntity?: O;
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

  emitPatch<P extends object, O extends object, ID>(queueKey: string, { partialEntity,
    oldEntity,
    newEntity,
    id, unset }: EmitPatchProps<P, O>) {
    for (const [key, value] of Object.entries(partialEntity)) {
      const payload = {
        entityId: id,
        key: key as keyof O,
        value,
        oldValue: oldEntity?.[key as keyof O],
        hasOld: !!oldEntity,
        partialEntity: partialEntity,
        newEntity,
        oldEntity,
      } as PatchEvent<P, O, ID>["payload"];

      this.emit(queueKey, payload);
    }

    if (unset) {
      for (const p of unset) {
        const payload = {
          entityId: id,
          key: p.join("."),
          value: undefined,
        } as PatchEvent<P, O, ID>["payload"];

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
