import { throwErrorPopStack } from "src/utils/others";

export class NotInitializedError extends Error {
  constructor() {
    super("Not initialized");
  }
}

export function assertInitialized(initialized: boolean): asserts initialized is true {
  if (!initialized)
    throwErrorPopStack(new NotInitializedError());
}