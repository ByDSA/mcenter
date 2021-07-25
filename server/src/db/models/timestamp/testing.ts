/* eslint-disable import/prefer-default-export */
import TimestampInterface from "./interface";

export function check<R extends TimestampInterface>(actual: R | null, expected: R) {
  if (!actual?.createdAt)
    throw new Error("createdAt is null or undefined");

  if (!actual?.updatedAt)
    throw new Error("updatedAt is null or undefined");

  const maxDiff = 5 * 1000;

  if (expected.createdAt)
    expect(actual.createdAt).toBe(expected.createdAt);
  else {
    const diff = +new Date() - actual.createdAt;

    expect(diff).toBeLessThanOrEqual(maxDiff);
  }

  if (expected.updatedAt)
    expect(actual.updatedAt).toBe(expected.updatedAt);
  else {
    const diff = +new Date() - actual.updatedAt;

    expect(diff).toBeLessThanOrEqual(maxDiff);
  }

  expect(actual.deletedAt).toBeUndefined();
}
