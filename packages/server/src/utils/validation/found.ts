import { throwErrorPopStack } from "$shared/utils/errors";
import { isDefined } from "$shared/utils/validation";
import { InternalServerErrorException, UnprocessableEntityException } from "@nestjs/common";

export function assertFound<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (!isDefined(value)) {
    const error = new UnprocessableEntityException();

    error.message += `: Data not found${msg ? `: ${msg}` : "."}`;
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
