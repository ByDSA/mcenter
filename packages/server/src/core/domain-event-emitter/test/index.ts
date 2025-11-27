import { createMockClass } from "$sharedTests/jest/mocking";
import { Provider } from "@nestjs/common";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { DomainEventEmitter } from "../domain-event-emitter";

class DomainEventEmitterMock extends createMockClass(MusicsRepository) {
}

export const domainEventEmitterProvider = {
  provide: DomainEventEmitter,
  useClass: DomainEventEmitterMock,
} satisfies Provider;
