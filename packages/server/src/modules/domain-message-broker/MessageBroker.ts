import { Consumer, EventQueue, MessageBroker } from "#utils/message-broker";

export default class Broker<P = any> implements MessageBroker<P> {
  #queues: Map<string, EventQueue>;

  constructor() {
    this.#queues = new Map();
  }

  publish(queueKey: string, event: any): Promise<void> {
    const queue = this.#queues.get(queueKey);

    if (!queue)
      throw new Error(`Queue ${queueKey} not found`);

    return queue.publish(event);
  }

  subscribe(queueKey: string, callback: Consumer<P>): Promise<void> {
    let queue = this.#queues.get(queueKey);

    if (!queue) {
      queue = new EventQueue();
      this.#queues.set(queueKey, queue);
    }

    queue.subscribe(queueKey, callback);

    return Promise.resolve();
  }
}