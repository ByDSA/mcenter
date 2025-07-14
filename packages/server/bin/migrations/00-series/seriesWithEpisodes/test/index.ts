import { throwErrorPopStack } from "$shared/utils/errors";
import { assertIsInstanceOf } from "$shared/utils/validation";
import { Model } from "../models";

export function expectSerieWithEpisodes(actual: Model, expected: Model) {
  try {
    expect(actual).toMatchObject(expected);
  } catch (error) {
    assertIsInstanceOf(error, Error);
    throwErrorPopStack(error);
  }
}