import { Event } from "./Event";

export interface MessageBroker<P> {
  publish(queueKey: string, event: Event<P>): Promise<void>;
  subscribe(queueKey: string, callback: (event: Event<P>)=> Promise<void>): Promise<void>;
}
