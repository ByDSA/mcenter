// eslint-disable-next-line import/no-internal-modules
import { parseQuery } from "./1-str-to-obj/QueryParser";
import { findParamsToQueryParams, FindQueryParams } from "./QueriesOdm";

describe.each([
  ["tag:rock", {
    $and: [{
      tags: {
        $in: [
          "rock",
          "only-rock",
        ],
      },
    }],
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
    $and: [{
      tags: {
        $in: [
          "rock",
          "only-rock",
        ],
      },
    },
    {
      tags: {
        $in: [
          "pop",
          "only-pop",
        ],
      },
    }],
  }],
  ["tag:rock * tag:pop * tag:jazz", {
    $and: [{
      tags: {
        $in: [
          "rock",
          "only-rock",
        ],
      },
    },
    {
      tags: {
        $in: [
          "pop",
          "only-pop",
        ],
      },
    },
    {
      tags: {
        $in: [
          "jazz",
          "only-jazz",
        ],
      },
    }],
  }],
  ["tag:rock + tag:pop + tag:jazz", {
    tags: {
      $in: [
        "rock",
        "only-rock",
        "pop",
        "only-pop",
        "jazz",
        "only-jazz",
      ],
    },
  }],
  ["(tag:rock * tag:pop) + tag:jazz", {
    $and: [{
      tags: {
        $in: [
          "rock",
          "only-rock",
        ],
      },
    },
    {
      tags: {
        $in: [
          "pop",
          "only-pop",
        ],
      },
    }],
    tags: {
      $in: [
        "jazz",
        "only-jazz",
      ],
    },
  }],
  ["tag:rock * weight:>50", {
    $and: [{
      tags: {
        $in: [
          "rock",
          "only-rock",
        ],
      },
    },
    ],
    weight: {
      $gt: 50,
    },
  }],
] as [string, FindQueryParams | null][],
)("tests", (query: string, expected: FindQueryParams | null) => {
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