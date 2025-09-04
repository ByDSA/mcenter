import { IntersectionNode, TagNode, UnionNode, WeightNode } from "../../query-object";
import { parseQuery } from "../query-parser";

const OR1_EXPECTED = {
  root: {
    type: "union",
    child1: {
      type: "tag",
      value: "rock",
    } satisfies TagNode,
    child2: {
      type: "tag",
      value: "pop",
    } satisfies TagNode,
  } satisfies UnionNode,
};

it("union operator +", () => {
  const query = "tag:rock + tag:pop";
  const obj = parseQuery(query);
  const expected = OR1_EXPECTED;

  expect(obj).toEqual(expected);
} );

it("union operator |", () => {
  const query = "tag:rock | tag:pop";
  const obj = parseQuery(query);
  const expected = OR1_EXPECTED;

  expect(obj).toEqual(expected);
} );

it("intersection operator", () => {
  const query = "tag:rock * tag:pop";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "intersection",
      child1: {
        type: "tag",
        value: "rock",
      } satisfies TagNode,
      child2: {
        type: "tag",
        value: "pop",
      } satisfies TagNode,
    } satisfies IntersectionNode,
  };

  expect(obj).toEqual(expected);
} );

it("double union operator", () => {
  const query = "tag:rock + tag:pop + tag:jazz";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "union",
      child1: {
        type: "union",
        child1: {
          type: "tag",
          value: "rock",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
      },
      child2: {
        type: "tag",
        value: "jazz",
      } satisfies TagNode,
    } satisfies UnionNode,
  };

  expect(obj).toEqual(expected);
} );

it("double intersection operator", () => {
  const query = "tag:rock * tag:pop * tag:jazz";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "intersection",
      child1: {
        type: "intersection",
        child1: {
          type: "tag",
          value: "rock",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
      },
      child2: {
        type: "tag",
        value: "jazz",
      } satisfies TagNode,
    } satisfies IntersectionNode,
  };

  expect(obj).toEqual(expected);
} );

it("mix union and intersection operators with parenthesis", () => {
  const query = "(tag:rock + tag:pop) * weight:>=50";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "intersection",
      child1: {
        type: "union",
        child1: {
          type: "tag",
          value: "rock",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
      } satisfies UnionNode,
      child2: {
        type: "weight",
        value: {
          type: "range",
          min: 50,
          minIncluded: true,
        },
      } satisfies WeightNode,
    } satisfies IntersectionNode,
  };

  expect(obj).toEqual(expected);
} );

it("mix union and intersection operators with parenthesis 2", () => {
  const query = "(tag:rock + tag:pop) * (tag:jazz + tag:metal)";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "intersection",
      child1: {
        type: "union",
        child1: {
          type: "tag",
          value: "rock",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
      } satisfies UnionNode,
      child2: {
        type: "union",
        child1: {
          type: "tag",
          value: "jazz",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "metal",
        } satisfies TagNode,
      } satisfies UnionNode,
    } satisfies IntersectionNode,
  };

  expect(obj).toEqual(expected);
} );

it("mix union and intersection operators with parentehsis 3", () => {
  const query = "(tag:rock * tag:pop) + (tag:jazz * tag:metal)";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "union",
      child1: {
        type: "intersection",
        child1: {
          type: "tag",
          value: "rock",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
      } satisfies IntersectionNode,
      child2: {
        type: "intersection",
        child1: {
          type: "tag",
          value: "jazz",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "metal",
        } satisfies TagNode,
      } satisfies IntersectionNode,
    } satisfies UnionNode,
  };

  expect(obj).toEqual(expected);
} );

it("difference operator", () => {
  const query = "tag:rock - tag:pop";
  const obj = parseQuery(query);
  const expected = {
    root: {
      type: "difference",
      child1: {
        type: "tag",
        value: "rock",
      } satisfies TagNode,
      child2: {
        type: "tag",
        value: "pop",
      } satisfies TagNode,
    },
  };

  expect(obj).toEqual(expected);
} );

it("test query", () => {
  const query = "(tag:\"rock\" + tag:\"pop\") * year:[1990,2000] - weight:>0.7";
  const obj = parseQuery(query);

  expect(obj).toBeDefined();
} );
