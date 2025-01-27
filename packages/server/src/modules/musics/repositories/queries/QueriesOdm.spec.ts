/* eslint-disable jest/no-conditional-expect */
import { parseQuery } from "./1-str-to-obj/QueryParser";
import { findParamsToQueryParams, FindQueryParams } from "./QueriesOdm";

describe.each([
  ["tag:rock", {
    $or: [
      {
        $and: [{
          tags: {
            $in: ["rock"],
          },
        },
        {
          $or: [{
            onlyTags: {
              $size: 0,
            },
          }, {
            onlyTags: {
              $exists: false,
            },
          },
          ],
        },
        ],
      },
      {
        onlyTags: {
          $in: ["rock"],
        },
      },
    ],
  },
  ],
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
      $or: [
        {
          $and: [{
            tags: {
              $in: ["rock"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["rock"],
          },
        },
      ],
    },
    {
      $or: [
        {
          $and: [{
            tags: {
              $in: ["pop"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["pop"],
          },
        },
      ],
    }],
  }],
  ["tag:rock * tag:pop * tag:jazz", {
    $and: [{
      $or: [
        {
          $and: [{
            tags: {
              $in: ["rock"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["rock"],
          },
        },
      ],
    },
    {
      $or: [
        {
          $and: [{
            tags: {
              $in: ["pop"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["pop"],
          },
        },
      ],
    },
    {
      $or: [
        {
          $and: [{
            tags: {
              $in: ["jazz"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["jazz"],
          },
        },
      ],
    }],
  }],
  ["tag:rock + tag:pop + tag:jazz", {
    $or: [{
      $or: [
        {
          $and: [{
            tags: {
              $in: ["rock"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["rock"],
          },
        },
      ],
    },
    {
      $or: [
        {
          $and: [{
            tags: {
              $in: ["pop"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["pop"],
          },
        },
      ],
    },
    {
      $or: [
        {
          $and: [{
            tags: {
              $in: ["jazz"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["jazz"],
          },
        },
      ],
    }],
  }],
  ["(tag:rock * tag:pop) + tag:jazz", {
    $or: [{
      $and: [{
        $or: [{
          $and: [{
            tags: {
              $in: ["rock"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        }, {
          onlyTags: {
            $in: ["rock"],
          },
        }],
      },
      {
        $or: [{
          $and: [{
            tags: {
              $in: ["pop"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        }, {
          onlyTags: {
            $in: ["pop"],
          },
        }],
      }],
    },
    {
      $or: [{
        $and: [{
          tags: {
            $in: ["jazz"],
          },
        }, {
          $or: [{
            onlyTags: {
              $size: 0,
            },
          }, {
            onlyTags: {
              $exists: false,
            },
          },
          ],
        }],
      }, {
        onlyTags: {
          $in: ["jazz"],
        },
      }],
    }],
  }],
  ["tag:rock * weight:>50", {
    $and: [{
      $or: [
        {
          $and: [{
            tags: {
              $in: ["rock"],
            },
          }, {
            $or: [{
              onlyTags: {
                $size: 0,
              },
            }, {
              onlyTags: {
                $exists: false,
              },
            },
            ],
          }],
        },
        {
          onlyTags: {
            $in: ["rock"],
          },
        },
      ],
    },
    {
      weight: {
        $gt: 50,
      },
    },
    ],
  }],
] as [string, FindQueryParams | null][])("tests", (query: string, expected: FindQueryParams | null) => {
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
