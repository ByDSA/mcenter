import { throwErrorPopStack } from "../../../utils/errors";
import { Music } from "../music";

export function expectMusics(actual: Music[], expected: Music[]) {
  try {
    expect(actual).toHaveLength(expected.length);

    for (let i = 0; i < actual.length; i++)
      expectMusic(actual[i], expected[i]);
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e);
    else
      throw e;
  }
}

export function expectMusic(actual: Music, expected: Music) {
  try {
    expect(actual).toEqual(expected);
  } catch (e) {
    if (e instanceof Error)
      throwErrorPopStack(e);
    else
      throw e;
  }
}
