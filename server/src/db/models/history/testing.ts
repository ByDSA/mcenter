/* eslint-disable import/prefer-default-export */
import { checkTimestamp } from "@models/timestamp";
import Interface from "./interface";

export function check(actual: Interface | null | undefined, expected: Interface) {
  checkTimestamp(actual, expected);

  expect(actual?.name).toBe(expected.name);

  const actualContentArray = actual?.content ? Array.from(actual?.content) : undefined;

  expect(actualContentArray).toStrictEqual(expected.content);
}
