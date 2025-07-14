import { BrokerEvent } from "./Event";

export interface MessageBroker<P> {
  publish(queueKey: string, event: BrokerEvent<P>): Promise<void>;
  subscribe(queueKey: string, callback: (event: BrokerEvent<P>)=> Promise<void>): Promise<void>;
}
