/* eslint-disable import/prefer-default-export */
import { checkTimestamp } from "../timestamp";
import { LocalResourceFileInterface, LocalResourceInterface, ResourceInterface } from "./interface";

export function check<R extends ResourceInterface>(actual: R | null, expected: R) {
  expect(actual).toBeDefined();
  expect(actual).not.toBeNull();

  if (!actual)
    throw new Error();

  checkTimestamp(actual, expected);

  expect(actual.name).toBe(expected.name);
  expect(actual.disabled).toBe(expected.disabled);
  expect(actual.url).toBe(expected.url);
  const actualTagsArray = actual.tags ? Array.from(actual.tags) : undefined;

  expect(actualTagsArray).toStrictEqual(expected.tags);
}

export function checkLocalFile<R extends LocalResourceFileInterface>(
  actual: R | null, expected: R,
) {
  checkLocal(actual, expected);

  if (!actual)
    throw new Error();

  expect(actual.hash).toStrictEqual(expected.hash);
}

export function checkLocal<R extends LocalResourceInterface>(actual: R | null, expected: R) {
  check(actual, expected);

  if (!actual)
    throw new Error();

  expect(actual.path).toBe(expected.path);
}
