import { createMockInstance } from "$sharedTests/jest/mocking";
import { Type, ValueProvider } from "@nestjs/common";

export function createMockProvider<T>(clazz: Type<T>): ValueProvider<T> {
  return {
    provide: clazz,
    useValue: createMockInstance(clazz),
  };
}

const regisretedMocks = new Map<Type<any>, any>();

export function getOrCreateMockProvider<T>(clazz: Type<T>): ValueProvider<T> {
  let ret = regisretedMocks.get(clazz);

  if (!ret) {
    ret = createMockInstance(clazz);
    registerMockProviderInstance(clazz, ret);
  }

  return {
    provide: clazz,
    useValue: ret,
  };
}

export function registerMockProviderInstance<T>(clazz: Type<T>, instance?: T): void {
  regisretedMocks.set(clazz, instance);
}
