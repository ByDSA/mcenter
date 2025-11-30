/* eslint-disable jest/no-conditional-expect */
import { TagNode } from "../../query-object";
import { parseQuery } from "../query-parser";

const createTag = (tag: string) => ( {
  root: {
    type: "tag",
    value: tag,
  } satisfies TagNode,
} );
const TAG_ROCK_OBJ = createTag("rock");
const invalidCharacters = "áéíóúàèìòùäëïöüÑÇñçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ?!¿¡\"'()";

describe.each([
  ["tag:rock", TAG_ROCK_OBJ],
  ["tag:#metal", createTag("#metal")],
  ["tag:", null],
  ["tag:rock\"", null],
  ["tag:?gim", null],
  ...[...invalidCharacters].map(c=>(["tag:" + c, null] as [string, null])),
])("parseQuery with different inputs", (query, expected) => {
  it(`should ${!expected ? "NOT " : ""}parse query: ${query}`, () => {
    if (expected === null)
      expect(() => parseQuery(query)).toThrow();
    else {
      const obj = parseQuery(query);

      expect(obj).toEqual(expected);
    }
  } );
} );
