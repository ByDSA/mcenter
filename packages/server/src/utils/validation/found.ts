import { throwErrorPopStack } from "$shared/utils/errors";
import { isDefined } from "$shared/utils/validation";
import { UnprocessableEntityException } from "@nestjs/common";

export function assertFound<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (!isDefined(value)) {
    const error = new UnprocessableEntityException(msg);

    error.message += `: ${msg}`;
    throwErrorPopStack(new UnprocessableEntityException(value));
  }
}
