type Cls<T> = new (...args: any[])=> T;

const map = new Map<Cls<unknown>, unknown>();

export class FetchApi {
  static register<T>(symbol: Cls<T>, instance: unknown) {
    map.set(symbol, instance);
  }

  static get<T>(cls: Cls<T>): T {
    const instance = map.get(cls);

    if (!instance)
      throw new Error(`No instance registered for class ${cls.name}`);

    return instance as T;
  }
}
