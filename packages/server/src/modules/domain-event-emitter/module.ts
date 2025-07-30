import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DomainEventEmitter } from "./domain-event-emitter";

@Global()
@Module( {
  imports: [
    EventEmitterModule.forRoot( {
      wildcard: true,
    } ),
  ],
  providers: [
    DomainEventEmitter,
  ],
  exports: [
    DomainEventEmitter,
  ],
} )
export class DomainEventEmitterModule {

}
