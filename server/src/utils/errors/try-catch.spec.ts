import { assertIsDefined, assertIsInstanceOf } from "#utils/validation";
import { tryCatch, tryCatchAsync, tryCatchLogError, tryCatchLogErrorAsync } from "./try-catch";

const ERROR_MESSAGE = "sasa";

describe("tryCatchLogError", () => {
  let error: Error;

  beforeAll(() => {
    jest.clearAllMocks();
    try {
      tryCatchLogError(() => {
        throw new Error(ERROR_MESSAGE);
      } );
    } catch (e) {
      error = e as Error;

      return;
    }

    throw new Error("No se ha lanzado el error");
  } );

  it("console.error has been called", () => {
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(1);
  } );

  it("Error is instance of Error", () => {
    assertIsInstanceOf(error, Error);
  } );

  it("expected stack for error", () => {
    assertIsDefined(error.stack);
    const stackSplited = error.stack.split("\n");

    expect(stackSplited[0]).toContain(ERROR_MESSAGE);
    expect(stackSplited[1]).toContain(__filename);
    expect(stackSplited[2]).toContain("Promise.then"); // interno de jest
  } );
} );

describe("tryCatch", () => {
  it("returns value", () => {
    const value = tryCatch(() => "value");

    expect(value).toBe("value");
  } );

  it("should not call handler if no error is thrown", () => {
    const handler = jest.fn();

    tryCatch(() => "value", handler);

    expect(handler).not.toHaveBeenCalled();
  } );

  it("should call handler", () => {
    const handler = jest.fn();

    tryCatch(() => {
      throw new Error();
    }, handler);

    expect(handler).toHaveBeenCalledTimes(1);
  } );

  it("expected stack for error", () => {
    let error: Error | undefined;
    const handler = jest.fn();

    tryCatch(() => {
      error = new Error(ERROR_MESSAGE);

      throw error;
    }, handler);
    assertIsDefined(error);
    assertIsDefined(error.stack);
    const stackSplited = error.stack.split("\n");

    expect(stackSplited[0]).toContain(ERROR_MESSAGE);
    expect(stackSplited[1]).toContain(__filename);
    expect(stackSplited[2]).toContain(__filename);
  } );
} );

describe("tryCatchAsync", () => {
  it("returns value", async () => {
    const value = await tryCatchAsync(() => Promise.resolve("value"));

    expect(value).toBe("value");
  } );

  it("should not call handler if no error is thrown", async () => {
    const handler = jest.fn();

    await tryCatchAsync(() => Promise.resolve("value"), handler);

    expect(handler).not.toHaveBeenCalled();
  } );

  it("should call handler", async () => {
    const handler = jest.fn();

    // eslint-disable-next-line require-await
    await tryCatchAsync(async () => {
      throw new Error();
    }, handler);

    expect(handler).toHaveBeenCalledTimes(1);
  } );

  it("expected stack for error", async () => {
    let error: Error | undefined;
    const handler = jest.fn();

    // eslint-disable-next-line require-await
    await tryCatchAsync(async () => {
      error = new Error(ERROR_MESSAGE);

      throw error;
    }, handler);
    assertIsDefined(error);
    assertIsDefined(error.stack);
    const stackSplited = error.stack.split("\n");

    expect(stackSplited[0]).toContain(ERROR_MESSAGE);
    expect(stackSplited[1]).toContain(__filename);
    expect(stackSplited[2]).toContain(__filename);
  } );
} );

describe("tryCatchLogErrorAsync", () => {
  let error: Error;

  beforeAll(async () => {
    jest.clearAllMocks();
    try {
      await tryCatchLogErrorAsync(() => {
        throw new Error(ERROR_MESSAGE);
      } );
    } catch (e) {
      error = e as Error;

      return;
    }

    throw new Error("No se ha lanzado el error");
  } );

  it("console.error has been called", () => {
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(1);
  } );

  it("Error is instance of Error", () => {
    assertIsInstanceOf(error, Error);
  } );

  it("expected stack for error", () => {
    assertIsDefined(error.stack);
    const stackSplited = error.stack.split("\n");

    expect(stackSplited[0]).toContain(ERROR_MESSAGE);
    expect(stackSplited[1]).toContain(__filename);
    expect(stackSplited[2]).toContain("Promise.then"); // interno de jest
  } );
} );