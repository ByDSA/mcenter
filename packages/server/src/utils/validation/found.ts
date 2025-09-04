import { ArrayOneOrMore } from "$shared/utils/arrays";
import { throwErrorPopStack } from "$shared/utils/errors";
import { assertIsNotEmpty, isDefined } from "$shared/utils/validation";
import { InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";

export function assertFoundClient<T>(
  value: T | null | undefined,
  msg?: string,
): asserts value is T {
  if (!isDefined(value)) {
    const error = new UnprocessableEntityException();

    error.message += `: Data not found${msg ? `: ${msg}` : "."}`;
    throwErrorPopStack(error);
  }
}

export function assertIsNotEmptyClient<T>(
  value: T[],
  msg?: string,
): asserts value is ArrayOneOrMore<T> {
  try {
    assertIsNotEmpty(value, msg);
  } catch (e) {
    if (!(e instanceof Error))
      throw e;

    const error = new UnprocessableEntityException();

    error.message += `: ${e.message}`;
    throwErrorPopStack(error);
  }
}

export function assertFoundServer<T>(value: T | null |
  undefined, msg?: string): asserts value is T {
  if (!isDefined(value)) {
    const error = new InternalServerErrorException();

    error.message += `: Data not found${msg ? `: ${msg}` : "."}`;
    throwErrorPopStack(error);
  }
}
