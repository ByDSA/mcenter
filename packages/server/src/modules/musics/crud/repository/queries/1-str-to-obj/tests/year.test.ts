/* eslint-disable jest/no-conditional-expect */
import { YearNode } from "../../query-object";
import { parseQuery } from "../query-parser";

const YEAR_1999_OBJ = {
  root: {
    type: "year",
    value: {
      type: "number",
      value: 1999,
    },
  } satisfies YearNode,
};
const YEAR_1999_2000_OBJ = {
  root: {
    type: "year",
    value: {
      type: "range",
      min: 1999,
      minIncluded: true,
      max: 2000,
      maxIncluded: true,
    },
  } satisfies YearNode,
};
const YEAR_MIN_1999_OBJ = {
  root: {
    type: "year",
    value: {
      type: "range",
      min: 1999,
      minIncluded: true,
    },
  } satisfies YearNode,
};
const YEAR_MAX_2000_OBJ = {
  root: {
    type: "year",
    value: {
      type: "range",
      max: 2000,
      maxIncluded: true,
    },
  } satisfies YearNode,
};
const YEAR_2000_OBJ = {
  root: {
    type: "year",
    value: {
      type: "number",
      value: 2000,
    },
  } satisfies YearNode,
};

describe.each([
  [
    "year:1999",
    YEAR_1999_OBJ,
  ],
  [
    "year:2000",
    YEAR_2000_OBJ,
  ],
  [
    "year:abcd",
    null,
  ],
  [
    "year:",
    null,
  ],
  [
    "year:[1999,2000]",
    YEAR_1999_2000_OBJ,
  ],
  [
    "year:[1999,]",
    YEAR_MIN_1999_OBJ,
  ],
  [
    "year:>=1999",
    YEAR_MIN_1999_OBJ,
  ],
  [
    "year:[,2000]",
    YEAR_MAX_2000_OBJ,
  ],
  [
    "year:<=2000",
    YEAR_MAX_2000_OBJ,
  ],
])("parseQuery with different year queries", (query, expected) => {
  it(`should parse query: ${query}`, () => {
    if (expected === null) {
      // Casos inválidos: esperamos un error
      expect(() => parseQuery(query)).toThrow();
    } else {
      // Casos válidos: verificamos el objeto esperado
      const obj = parseQuery(query);

      expect(obj).toEqual(expected);
    }
  } );
} );
