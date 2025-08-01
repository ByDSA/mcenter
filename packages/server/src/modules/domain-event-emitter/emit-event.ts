/* eslint-disable func-names */
import { isDefined } from "$shared/utils/validation";
import { Logger } from "@nestjs/common";
import { Entity, EntityEvent } from "./events";
import { getEventEmitter } from "./get-event-emitter";

type DataMapper<TResult, TArgs extends readonly unknown[]> =
  (result: TResult, args: TArgs)=> unknown;

export function EmitEvent<TResult = unknown, TArgs extends readonly unknown[] = unknown[]>(
  eventType: string,
  dataMapper?: DataMapper<TResult, TArgs>,
) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: readonly any[]) {
      const result = await originalMethod.apply(this, args);
      const eventEmitter = getEventEmitter(this);

      if (eventEmitter) {
        const eventData = dataMapper
          ? dataMapper(result, args as TArgs)
          : {
            result,
            args,
          };

        eventEmitter.emit(eventType, eventData);
      } else {
        new Logger().error(
          `⚠️ EventEmitter2 no encontrado en ${this.constructor.name} para evento: ${eventType}`,
        );
      }

      return result;
    };

    return descriptor;
  };
}

export function EmitEntityEvent<T>(
  eventType: string,
) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: readonly any[]) {
      const result = await originalMethod.apply(this, args) as Entity<T> | Entity<T>[];
      const eventEmitter = getEventEmitter(this);

      if (eventEmitter) {
        // Determinar qué datos usar (resultado o primer argumento)
        const dataToProcess = result ?? args[0] as object[] | object;

        if (!isDefined(dataToProcess) || typeof dataToProcess !== "object") {
          throw new Error(
            `EmitEntityEvent: No se pudo determinar el dato a emitir para el evento ${eventType}`,
          );
        }

        // Si es un array, emitir un evento para cada elemento
        if (Array.isArray(dataToProcess)) {
          for (const entity of dataToProcess) {
            const eventData = {
              type: eventType,
              payload: {
                entity,
              },
            } satisfies EntityEvent<typeof entity>;

            await eventEmitter.emitAsync(eventType, eventData);
          }
        } else {
          // Comportamiento original para elementos individuales
          const eventData = result
            ? {
              type: eventType,
              payload: {
                entity: result as Entity<T>,
              },
            } satisfies EntityEvent<Entity<T>>
            : {
              type: eventType,
              payload: {
                entity: args[0],
              },
            } satisfies EntityEvent<Entity<T>>;

          await eventEmitter.emitAsync(eventType, eventData);
        }
      } else {
        new Logger().error(
          `⚠️ EventEmitter2 no encontrado en ${this.constructor.name} para evento: ${eventType}`,
        );
      }

      return result;
    };

    return descriptor;
  };
}
