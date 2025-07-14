import { BrokerEvent } from "./Event";

export type Consumer<P> = (event: BrokerEvent<P>)=> Promise<void>;
