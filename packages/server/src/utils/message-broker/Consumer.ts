import { Event } from "./Event";

export type Consumer<P> = (event: Event<P>)=> Promise<void>;
