// eslint-disable-next-line import/no-internal-modules
import { parseQuery } from "./1-str-to-obj/QueryParser";
import { findParamsToQueryParams, FindQueryParams } from "./QueriesOdm";

describe.each([
  ["tag:rock", {
    tags: {
      $all: [
        "rock",
      ],
    },
  }],
  ["weight:>=50", {
    weight: {
      $gte: 50,
    },
  }],
  ["weight:>50", {
    weight: {
      $gt: 50,
    },
  }],
  ["weight:<50", {
    weight: {
      $lt: 50,
    },
  }],
  ["weight:<=50", {
    weight: {
      $lte: 50,
    },
  }],
  ["tag:rock * tag:pop", {
    tags: {
      $all: [
        "rock", "pop",
      ],
    },
  }],
  ["tag:rock * tag:pop * tag:jazz", {
    tags: {
      $all: [
        "rock", "pop", "jazz",
      ],
    },
  }],
  ["tag:rock + tag:pop + tag:jazz", {
    tags: {
      $in: [
        "rock", "pop", "jazz",
      ],
    },
  }],
  ["(tag:rock * tag:pop) + tag:jazz", null],
  ["tag:rock * weight:>50", {
    tags: {
      $all: [
        "rock",
      ],
    },
    weight: {
      $gt: 50,
    },
  }],
])("tests", (query: string, expected: FindQueryParams | null) => {
  it(`query=${query}`, () => {
    const f = (q: string) => {
      const obj = parseQuery(q);

      return findParamsToQueryParams(obj.root);
    };

    if (expected === null)
      expect(() => f(query)).toThrow();
    else {
      const actual = f(query);

      expect(actual).toEqual(expected);
    }
  } );
} );