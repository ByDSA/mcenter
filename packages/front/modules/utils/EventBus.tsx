import { useEffect } from "react";

type EventCallback<T = any> = (data: T)=> void;
type UnsubscribeFunction = ()=> void;

class EventBus {
  private subscribers: Map<string, EventCallback[]>;

  constructor() {
    this.subscribers = new Map();
  }

  subscribe<T = any>(event: string, callback: EventCallback<T>): UnsubscribeFunction {
    if (!this.subscribers.has(event))
      this.subscribers.set(event, []);

    this.subscribers.get(event)!.push(callback);

    // Retorna función de des-subscripción
    return () => {
      const callbacks = this.subscribers.get(event);

      if (!callbacks)
        return;

      const index = callbacks.indexOf(callback);

      if (index > -1)
        callbacks.splice(index, 1);
    };
  }

  publish<T = any>(event: string, data?: T): void {
    if (!this.subscribers.has(event))
      return;

    this.subscribers.get(event)!.forEach(callback => {
      callback(data);
    } );
  }

  getSubscriberCount(event: string): number {
    return this.subscribers.get(event)?.length || 0;
  }
}

const eventBus = new EventBus();

export function useSubscription<T = any>(
  event: string,
  callback: EventCallback<T>,
): void {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(event, callback);

    return () => {
      unsubscribe();
    };
  }, [event, callback]);
}

export function usePublishEvent<T = any>(event: string, data: T, deps: any[] = [data]): void {
  useEffect(()=> {
    eventBus.publish(event, data);
  }, deps);
}
