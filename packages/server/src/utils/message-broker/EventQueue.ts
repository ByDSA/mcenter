import Consumer from "./Consumer";
import Event from "./Event";

export default class EventQueue {
  #consumers: Consumer<any>[];

  constructor() {
    this.#consumers = [];
  }

  async publish(event: Event<any>): Promise<void> {
    const promises: Promise<void>[] = [];

    this.#consumers.forEach(consumer => {
      promises.push(consumer(event));
    } );

    await Promise.all(promises);

    return Promise.resolve();
  }

  subscribe(eventType: string, callback: Consumer<any>): Promise<void> {
    this.#consumers.push(callback);

    return Promise.resolve();
  }
}