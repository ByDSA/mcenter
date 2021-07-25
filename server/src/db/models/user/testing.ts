/* eslint-disable import/prefer-default-export */
import { checkTimestamp } from "../timestamp";
import Doc from "./document";
import Interface from "./interface";

export function check(actual: Doc | null, expected: Interface) {
  expect(actual).toBeDefined();
  expect(actual).not.toBeNull();

  checkTimestamp(actual, expected);

  expect(actual?.name).toBe(expected.name);
  expect(actual?.comparePassSync(expected.pass)).toBeTruthy();
}
