import { throwErrorPopStack } from "$shared/utils/errors";
import { isDefined } from "$shared/utils/validation";
import { NotFoundException } from "@nestjs/common";

export function assertFound<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (!isDefined(value))
    throwErrorPopStack(new NotFoundException(msg));
}
