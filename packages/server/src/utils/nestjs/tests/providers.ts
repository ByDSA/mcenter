import { createMockInstance } from "$sharedTests/jest/mocking";
import { Type, ValueProvider } from "@nestjs/common";

export function createMockProvider<T>(clazz: Type<T>): ValueProvider<T> {
  return {
    provide: clazz,
    useValue: createMockInstance(clazz),
  };
}
