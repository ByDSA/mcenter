import { IntersectionNode, TagNode, UnionNode, WeightNode, YearNode } from "../QueryObject";
import { parseQuery } from "./QueryParser";

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

const TAG_ROCK_OBJ = {
  root: {
    type: "tag",
    value: "rock",
  },
};

describe.each([
  ["tag:\"rock\"", TAG_ROCK_OBJ],
  ["tag:rock", TAG_ROCK_OBJ],
  ["tag:", null],
  ["tag:\"rock", null],
  ["tag:rock\"", null],
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

it("union opeator +", () => {
  const query = "tag:rock + tag:pop";
  const obj = parseQuery(query);
  const expected = OR1_EXPECTED;

  expect(obj).toEqual(expected);
} );

it("union opeator |", () => {
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
        type: "tag",
        value: "rock",
      } satisfies TagNode,
      child2: {
        type: "union",
        child1: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "jazz",
        } satisfies TagNode,
      } satisfies UnionNode,
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
        type: "tag",
        value: "rock",
      } satisfies TagNode,
      child2: {
        type: "intersection",
        child1: {
          type: "tag",
          value: "pop",
        } satisfies TagNode,
        child2: {
          type: "tag",
          value: "jazz",
        } satisfies TagNode,
      } satisfies IntersectionNode,
    } satisfies IntersectionNode,
  };

  expect(obj).toEqual(expected);
} );

it("mix union and intersection operators", () => {
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

it("mix union and intersection operators 2", () => {
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

it("mix union and intersection operators 3", () => {
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
        type:"tag",
        value:"rock",
      } satisfies TagNode,
      child2: {
        type:"tag",
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