/* eslint-disable import/prefer-default-export */
import { checkLocalFileResource } from "../resource";
import Doc from "./document";
import Interface from "./interface";

export function check(actual: Doc | null, expected: Interface) {
  checkLocalFileResource(actual, expected);

  expect(actual?.artist).toBe(expected.artist);
  expect(actual?.album).toBe(expected.album);
  expect(actual?.duration).toBe(expected.duration);
}
