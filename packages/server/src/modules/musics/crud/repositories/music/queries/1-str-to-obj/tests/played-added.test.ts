/* eslint-disable jest/no-conditional-expect */
import clone from "just-clone";
import { AddedNode, PlayedNode } from "../../query-object";
import { parseQuery } from "../query-parser";

const fakeNow = new Date(2025, 5, 1, 12, 0, 0, 0);
const fake1YearAgo = new Date(2024, 5, 1, 12, 0, 0, 0);
const fake5MonthAgo = new Date(2025, 0, 1, 12, 0, 0, 0);
const fake4WeeksAgo = new Date(2025, 4, 4, 12, 0, 0, 0);
const fake10DaysAgo = new Date(2025, 4, 22, 12, 0, 0, 0);
const PLAYED_1YAGO_OBJ = {
  root: {
    type: "played",
    value: {
      type: "range-date",
      max: fake1YearAgo,
      maxIncluded: false,
    },
  } satisfies PlayedNode,
};
const PLAYED_1YAGO_INCL_OBJ = clone(PLAYED_1YAGO_OBJ);

(PLAYED_1YAGO_INCL_OBJ.root.value as any).maxIncluded = true;

const PLAYED_5MAGO_OBJ = {
  root: {
    type: "played",
    value: {
      type: "range-date",
      max: fake5MonthAgo,
      maxIncluded: false,
    },
  } satisfies PlayedNode,
};
const PLAYED_4WAGO_OBJ = {
  root: {
    type: "played",
    value: {
      type: "range-date",
      max: fake4WeeksAgo,
      maxIncluded: false,
    },
  } satisfies PlayedNode,
};
const PLAYED_10DAGO_OBJ = {
  root: {
    type: "played",
    value: {
      type: "range-date",
      max: fake10DaysAgo,
      maxIncluded: false,
    },
  } satisfies PlayedNode,
};

beforeAll(() => {
  // Activa los timers falsos
  jest.useFakeTimers();
  // Establece una fecha específica
  jest.setSystemTime(fakeNow);
} );

afterAll(() => {
  // Restaura los timers reales
  jest.useRealTimers();
} );

describe.each([
  [
    "played:<1y",
    PLAYED_1YAGO_OBJ,
  ],
  [
    "played:<=1y",
    PLAYED_1YAGO_INCL_OBJ,
  ],
  [
    "played:<4w",
    PLAYED_4WAGO_OBJ,
  ],
  [
    "played:<10d",
    PLAYED_10DAGO_OBJ,
  ],
  [
    "played:<5m",
    PLAYED_5MAGO_OBJ,
  ],
  [
    "played:abcd",
    null,
  ],
  [
    "played:",
    null,
  ],
])("parseQuery with different played queries", (query, expected) => {
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

const ADDED_1YAGO_OBJ = {
  root: {
    type: "added",
    value: {
      type: "range-date",
      min: fake1YearAgo,
      minIncluded: false,
    },
  } satisfies AddedNode,
};

it("added", () => {
  const obj = parseQuery("added:>1y");

  expect(obj).toEqual(ADDED_1YAGO_OBJ);
} );
