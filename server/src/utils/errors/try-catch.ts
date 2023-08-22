import { ResendErrorLessStackOptions, rethrowErrorLessStackOptionsAddLevel, throwErrorPopStack } from "./stack";

type FunctionToTry<R> = ()=> R;
export function tryCatchLogError<R>(f: FunctionToTry<R>) {
  return tryCatch(f, (error) => {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  } );
}

type ErrorHandler = (error: Error)=> any;
// eslint-disable-next-line consistent-return
export function tryCatch<R>(f: FunctionToTry<R>, errorHandler?: ErrorHandler): R | undefined {
  try {
    return f();
  } catch (error: unknown) {
    if (errorHandler && error instanceof Error)
      errorHandler(error);
  }
}

// eslint-disable-next-line consistent-return
export async function tryCatchAsync<R>(f: FunctionToTry<R>, errorHandler?: ErrorHandler): Promise<R | undefined> {
  try {
    return await f();
  } catch (error) {
    if (errorHandler && error instanceof Error)
      errorHandler(error);
  }
}

export function tryCatchResendErrorWithLessStack<R>(f: FunctionToTry<R>, opts?: ResendErrorLessStackOptions) {
  const fixedOpts = opts ? rethrowErrorLessStackOptionsAddLevel(opts, 3) : opts;
  let ret;

  tryCatch(f, (error: Error) => {
    ret = throwErrorPopStack(error, fixedOpts);
  } );

  return ret;
}

export function tryCatchLogErrorAsync<R>(f: FunctionToTry<R>): Promise<R | undefined> {
  return tryCatchAsync(f, (error) => {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  } );
}