import { MusicRepository } from "#musics/rest/repository";
import { createMockClass } from "#tests/jest/mocking";
import { DomainEventEmitter } from "../domain-event-emitter";

class DomainEventEmitterMock extends createMockClass(MusicRepository) {
}

export const domainEventEmitterProvider = {
  provide: DomainEventEmitter,
  useClass: DomainEventEmitterMock,
};
