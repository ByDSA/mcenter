/* eslint-disable import/prefer-default-export */
import { checkResource } from "../resource";
import Doc from "./document";
import Interface from "./interface";

export function check(actual: Doc | null, expected: Interface) {
  checkResource(actual, expected);

  expect(actual?.artist).toBe(expected.artist);
  expect(actual?.name).toBe(expected.name);
  expect(actual?.duration).toBe(expected.duration);
  expect(actual?.hash).toBe(expected.hash);
  expect(actual?.path).toBe(expected.path);
  expect(actual?.url).toBe(expected.url);
  const actualTags = Array.from(actual?.tags ?? []);

  expect(actualTags).toStrictEqual(expected.tags);
  expect(actual?.weight).toBe(expected.weight);
}
