import { createMockInstance } from "$sharedTests/jest/mocking";
import { Type, ValueProvider } from "@nestjs/common";

export function createMockProvider<T>(clazz: Type<T>): ValueProvider<T> {
  return {
    provide: clazz,
    useValue: createMockInstance(clazz),
  };
}

const regisretedMocks = new Map<Type<any>, any>();

function getMockInstance<T>(clazz: Type<T>): T {
  if (!regisretedMocks.has(clazz))
    regisretedMocks.set(clazz, createMockInstance(clazz));

  return regisretedMocks.get(clazz);
}

export function getOrCreateMockProvider<T>(clazz: Type<T>): ValueProvider<T> {
  let ret = getMockInstance(clazz);

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
