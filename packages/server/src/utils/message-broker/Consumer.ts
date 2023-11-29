import Event from "./Event";

type Consumer<P> = (event: Event<P>)=> Promise<void>;

export default Consumer;