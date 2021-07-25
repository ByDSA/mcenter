/* eslint-disable import/prefer-default-export */
import { checkTimestamp } from "../timestamp";
import { ResourceInterface } from "./interface";

export function check<R extends ResourceInterface>(actual: R | null, expected: R) {
  expect(actual).toBeDefined();
  expect(actual).not.toBeNull();

  checkTimestamp(actual, expected);
}
