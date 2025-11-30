/* eslint-disable jest/no-conditional-expect */
import { parseQuery } from "./1-str-to-obj/query-parser";
import { expressionToMeilisearchQuery } from "./queries-meili";

describe.each([
  ["year:1990", "year = 1990"],
  ["year:>=1990", "year >= 1990"],
  ["year:>1990", "year > 1990"],
  ["year:<=1990", "year <= 1990"],
  ["year:<1990", "year < 1990"],
  ["weight:100", "weight = 100"],
  ["weight:>=100", "weight >= 100"],
  ["tag:rock",
    "(tags IN [\"rock\"] AND onlyTags IS NULL) OR onlyTags IN [\"rock\"]",
  ],
  ["weight:>=50", "weight >= 50"],
  ["weight:>50", "weight > 50"],
  ["weight:<50", "weight < 50"],
  ["weight:<=50", "weight <= 50"],
  ["tag:rock * tag:pop",
    "((tags IN [\"rock\"] AND onlyTags IS NULL) OR onlyTags IN [\"rock\"]) \
AND ((tags IN [\"pop\"] AND onlyTags IS NULL) OR onlyTags IN [\"pop\"])",
  ],
  ["tag:rock * tag:pop * tag:jazz",
    "(((tags IN [\"rock\"] AND onlyTags IS NULL) OR onlyTags IN [\"rock\"]) \
AND ((tags IN [\"pop\"] AND onlyTags IS NULL) OR onlyTags IN [\"pop\"])) \
AND ((tags IN [\"jazz\"] AND onlyTags IS NULL) OR onlyTags IN [\"jazz\"])",
  ],
  ["tag:rock + tag:pop + tag:jazz",
    "(((tags IN [\"rock\"] AND onlyTags IS NULL) OR onlyTags IN [\"rock\"]) \
OR ((tags IN [\"pop\"] AND onlyTags IS NULL) OR onlyTags IN [\"pop\"])) \
OR ((tags IN [\"jazz\"] AND onlyTags IS NULL) OR onlyTags IN [\"jazz\"])",
  ],
  ["(tag:rock * tag:pop) + tag:jazz",
    "(((tags IN [\"rock\"] AND onlyTags IS NULL) OR onlyTags IN [\"rock\"]) \
AND ((tags IN [\"pop\"] AND onlyTags IS NULL) OR onlyTags IN [\"pop\"])) \
OR ((tags IN [\"jazz\"] AND onlyTags IS NULL) OR onlyTags IN [\"jazz\"])"],
  ["tag:rock * weight:>50",
    "((tags IN [\"rock\"] AND onlyTags IS NULL) OR onlyTags IN [\"rock\"]) \
AND (weight > 50)",
  ],
] as [string, string | null][])(
  "tests",
  (query: string, expected: string | null) => {
    it(`query=${query}`, () => {
      const f = (q: string) => {
        const expr = parseQuery(q);
        const obj = expressionToMeilisearchQuery(expr.root, null);

        return obj;
      };

      if (expected === null)
        expect(() => f(query)).toThrow();
      else {
        const actual = f(query);

        expect(actual).toEqual(expected);
      }
    } );
  },
);
