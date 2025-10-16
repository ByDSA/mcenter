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

describe.each([
  ["tag:\"rock\"", TAG_ROCK_OBJ],
  ["tag:rock", TAG_ROCK_OBJ],
  ["tag:", null],
  ["tag:\"rock", null],
  ["tag:rock\"", null],
  ["tag:aáéíóúàèìòù", createTag("aáéíóúàèìòù")],
  ["tag:aäëïöü", createTag("aäëïöü")],
  ["tag:ÑÇñç", createTag("ÑÇñç")],
  ["tag:ÁÉÍÓÚÀÈÌÒÙ", createTag("ÁÉÍÓÚÀÈÌÒÙ")],
  ["tag:ÄËÏÖÜ", createTag("ÄËÏÖÜ")],
  ["tag:?gim", createTag("?gim")],
  ["tag:!¿¡", createTag("!¿¡")],
  ["tag:\"?gim\"", createTag("?gim")],
  ["tag:#metal", createTag("#metal")],
  ["tag:\"#metal\"", createTag("#metal")],
])("parseQuery with different inputs", (query, expected) => {
  it(`should parse query: ${query}`, () => {
    if (expected === null)
      expect(() => parseQuery(query)).toThrow();
    else {
      const obj = parseQuery(query);

      expect(obj).toEqual(expected);
    }
  } );
} );
