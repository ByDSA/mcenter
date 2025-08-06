import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicsRepository } from "#musics/crud/repository";
import { DomainEventEmitter } from "../domain-event-emitter";

class DomainEventEmitterMock extends createMockClass(MusicsRepository) {
}

export const domainEventEmitterProvider = {
  provide: DomainEventEmitter,
  useClass: DomainEventEmitterMock,
};
