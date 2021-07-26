/* eslint-disable import/prefer-default-export */
import { checkTimestamp } from "../timestamp";
import Interface from "./interface";

export function check(actual: Interface | null | undefined, expected: Interface) {
  checkTimestamp(actual, expected);

  expect(actual?.name).toBe(expected.name);
  expect(actual?.typeResource).toBe(expected.typeResource);

  if (actual?.content) {
    const actualArray = Array.from(actual?.content);

    expect(actualArray.sort()).toStrictEqual(expected.content?.sort());
  }
}
