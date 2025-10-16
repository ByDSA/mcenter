import { createMockClass } from "$sharedTests/jest/mocking";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { DomainEventEmitter } from "../domain-event-emitter";

class DomainEventEmitterMock extends createMockClass(MusicsRepository) {
}

export const domainEventEmitterProvider = {
  provide: DomainEventEmitter,
  useClass: DomainEventEmitterMock,
};
