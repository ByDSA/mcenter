import { errorSliceStack } from "./stack";

type FunctionToTry<R> = ()=> R;
export function tryCatchLogError<R>(f: FunctionToTry<R>) {
  return tryCatch(f, (error) => {
    console.error(error);
    throw errorSliceStack(error, 2, 2);
  } );
}

type ErrorHandler = (error: Error)=> any;

export function tryCatch<R>(f: FunctionToTry<R>, errorHandler?: ErrorHandler): R | undefined {
  try {
    return f();
  } catch (error: unknown) {
    if (errorHandler && error instanceof Error) {
      const errorPoped = errorSliceStack(error, 2, 1);

      errorHandler(errorPoped);
    }
  }
}

export async function tryCatchAsync<R>(
  f: FunctionToTry<R>,
  errorHandler?: ErrorHandler,
): Promise<R | undefined> {
  try {
    return await f();
  } catch (error) {
    if (errorHandler && error instanceof Error) {
      const errorPoped = errorSliceStack(error, 2, process.env.NODE_ENV === "test" ? 11 : 6);

      errorHandler(errorPoped);
    }
  }
}

export function tryCatchLogErrorAsync<R>(f: FunctionToTry<R>): Promise<R | undefined> {
  return tryCatchAsync(f, (error) => {
    console.error(error);
    throw errorSliceStack(error, 2, 2);
  } );
}
