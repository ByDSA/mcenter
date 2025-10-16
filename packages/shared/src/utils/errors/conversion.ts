export function toGenericError(error: Error): Error {
  const newError = new Error(error.message);

  newError.stack = error.stack;
  newError.cause = error;

  return newError;
}
