import { Consumer } from "./Consumer";
import { BrokerEvent } from "./Event";

export class BrokerEventQueue {
  #consumers: Consumer<any>[];

  constructor() {
    this.#consumers = [];
  }

  async publish(event: BrokerEvent<any>): Promise<void> {
    const promises: Promise<void>[] = [];

    this.#consumers.forEach(consumer => {
      promises.push(consumer(event));
    } );

    await Promise.all(promises);

    return Promise.resolve();
  }

  subscribe(_eventType: string, callback: Consumer<any>): Promise<void> {
    this.#consumers.push(callback);

    return Promise.resolve();
  }
}
