import Consumer from "./Consumer";
import Event from "./Event";

export default class EventQueue {
  #consumers: Consumer<any>[];

  constructor() {
    this.#consumers = [];
  }

  publish(event: Event<any>): Promise<void> {
    this.#consumers.forEach(consumer => consumer(event));

    return Promise.resolve();
  }

  subscribe(eventType: string, callback: Consumer<any>): Promise<void> {
    this.#consumers.push(callback);

    return Promise.resolve();
  }
}