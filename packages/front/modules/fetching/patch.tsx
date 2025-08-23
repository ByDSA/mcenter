import { getDiff } from "../utils/objects";

export function shouldSendPatchWithBody(body: ReturnType<typeof generatePatchBody>): boolean {
  if (Object.entries(body.entity).length > 0)
    return true;

  if (body.unset && Object.entries(body.unset).length > 0)
    return true;

  return false;
}

export function generatePatchBody<T extends object>(
  initial: T,
  current: T,
  allowedProps: readonly (keyof T)[],
) {
  const filteredInitial = allowedProps.reduce((acc, prop) => {
    if (prop in initial)
      (acc as any)[prop] = initial[prop];

    return acc;
  }, {} as Partial<T>);
  const filteredCurrent = allowedProps.reduce((acc, prop) => {
    if (prop in current)
      (acc as any)[prop] = current[prop];

    return acc;
  }, {} as Partial<T>);
  const patchBodyParams = getDiff(
    filteredInitial,
    filteredCurrent,
  );

  return patchBodyParams;
}
