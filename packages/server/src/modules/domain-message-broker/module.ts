import { Global, Module } from "@nestjs/common";
import { Broker } from "./MessageBroker";

@Global()
@Module( {
  providers: [
    Broker,
  ],
  exports: [
    Broker,
  ],
} )
export class DomainMessageBrokerModule {

}
