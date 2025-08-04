import { MusicsRepository } from "#modules/musics/crud/repository";
import { createMockClass } from "#tests/jest/mocking";
import { DomainEventEmitter } from "../domain-event-emitter";

class DomainEventEmitterMock extends createMockClass(MusicsRepository) {
}

export const domainEventEmitterProvider = {
  provide: DomainEventEmitter,
  useClass: DomainEventEmitterMock,
};
