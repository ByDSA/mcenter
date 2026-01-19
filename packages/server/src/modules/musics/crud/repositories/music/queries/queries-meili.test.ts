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
  ["!weight:>=100", "NOT (weight >= 100)"],
  ["weight:>=100 ~ weight:>=200", "(weight >= 100) AND NOT (weight >= 200)"],
  ["tag:rock", "tags IN [\"rock\"]"],
  ["weight:>=50", "weight >= 50"],
  ["weight:>50", "weight > 50"],
  ["weight:<50", "weight < 50"],
  ["weight:<=50", "weight <= 50"],
  ["tag:rock * tag:pop", "(tags IN [\"rock\"]) AND (tags IN [\"pop\"])"],
  [
    "tag:rock * tag:pop * tag:jazz",
    "((tags IN [\"rock\"]) AND (tags IN [\"pop\"])) AND (tags IN [\"jazz\"])",
  ],
  [
    "tag:rock + tag:pop + tag:jazz",
    "((tags IN [\"rock\"]) OR (tags IN [\"pop\"])) OR (tags IN [\"jazz\"])",
  ],
  [
    "tag:rock * tag:pop + tag:jazz",
    "((tags IN [\"rock\"]) AND (tags IN [\"pop\"])) OR (tags IN [\"jazz\"])",
  ],
  [
    "tag:rock + tag:pop * tag:jazz",
    "(tags IN [\"rock\"]) OR ((tags IN [\"pop\"]) AND (tags IN [\"jazz\"]))",
  ],
  ["tag:rock * weight:>50", "(tags IN [\"rock\"]) AND (weight > 50)"],
  [
    "playlist:favorites~(tag:#metal*tag:#vg)",
    "(privatePlaylistSlugs IN [\"favorites\"]) AND NOT ((tags IN [\"#metal\"]) AND (tags IN \
[\"#vg\"]))",
  ],
] as [string, string | null][])(
  "tests",
  (query: string, expected: string | null) => {
    it(`query=${query}`, async () => {
      const f = async (q: string) => {
        const expr = parseQuery(q);
        const obj = await expressionToMeilisearchQuery(expr.root, null);

        return obj;
      };

      if (expected === null)
        expect(async () => await f(query)).toThrow();
      else {
        const actual = await f(query);

        expect(actual).toEqual(expected);
      }
    } );
  },
);
