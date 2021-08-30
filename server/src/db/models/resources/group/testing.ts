/* eslint-disable import/prefer-default-export */
import { checkResource } from "../resource";
import Interface, { FixedContentGroup } from "./interface";

export function check(actual: Interface | null, expected: Interface) {
  checkResource(actual, expected);

  if (!actual)
    throw new Error();

  expect(actual.type).toBe(expected.type);
  expect(actual.visibility).toBe(expected.visibility);

  if ("query" in actual.content && "query" in expected.content)
    expect(actual.content).toStrictEqual(expected.content);
  else {
    const actualContent = <FixedContentGroup>actual.content;
    const expectedContent = <FixedContentGroup>expected.content;

    expect(actualContent.length).toBe(expectedContent.length);

    for (let i = 0; i < actualContent.length; i++) {
      const actualI = actualContent[i];
      const expectedI = expectedContent[i];

      expect(actualI.id).toStrictEqual(expectedI.id);
      expect(actualI.url).toBe(expectedI.url);
      expect(actualI.weight).toBe(expectedI.weight);
      expect(actualI.type).toBe(expectedI.type);
    }
  }
}
