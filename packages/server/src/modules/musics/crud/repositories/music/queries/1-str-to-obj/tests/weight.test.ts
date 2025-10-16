/* eslint-disable jest/no-conditional-expect */
import { WeightNode } from "../../query-object";
import { parseQuery } from "../query-parser";

const WEIGHT_50_OBJ = {
  root: {
    type: "weight",
    value: {
      type: "number",
      value: 50,
    },
  } satisfies WeightNode,
};
const WEIGHT_MIN_50_OBJ = {
  root: {
    type: "weight",
    value: {
      type: "range",
      min: 50,
      minIncluded: true,
    },
  } satisfies WeightNode,
};
const WEIGHT_50_100_OBJ = {
  root: {
    type: "weight",
    value: {
      type: "range",
      min: 50,
      minIncluded: true,
      max: 100,
      maxIncluded: true,
    },
  } satisfies WeightNode,
};
const WEIGHT_MAX_100_OBJ = {
  root: {
    type: "weight",
    value: {
      type: "range",
      max: 100,
      maxIncluded: true,
    },
  } satisfies WeightNode,
};

describe.each([
  [
    "weight:50",
    WEIGHT_50_OBJ,
  ],
  [
    "weight:abcd",
    null,
  ],
  [
    "weight:",
    null,
  ],
  [
    "weight:[50,100]",
    WEIGHT_50_100_OBJ,
  ],
  [
    "weight:[50,]",
    WEIGHT_MIN_50_OBJ,
  ],
  [
    "weight:>=50",
    WEIGHT_MIN_50_OBJ,
  ],
  [
    "weight:[,100]",
    WEIGHT_MAX_100_OBJ,
  ],
  [
    "weight:<=100",
    WEIGHT_MAX_100_OBJ,
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
