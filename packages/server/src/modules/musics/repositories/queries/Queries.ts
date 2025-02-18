import { Request } from "express";
import { parseQuery } from "./1-str-to-obj/QueryParser";
import { ExpressionNode, IntersectionNode, TagNode, WeightNode } from "./QueryObject";

export function requestToFindMusicParams(req: Request): ExpressionNode | null {
  const query = <string | undefined>req.query.q;

  if (!query)
    return oldForm(req);

  return parseQuery(query).root;
}

/**
 * @deprecated
 */
function oldForm(req: Request): ExpressionNode | null {
  const tagsQuery = <string | undefined>req.query.tags;
  const minWeightQuery = <string | undefined>req.query.minWeight;
  const maxWeightQuery = <string | undefined>req.query.maxWeight;
  let tagsNode: TagNode | undefined;
  let weightNode: WeightNode | undefined;

  if (tagsQuery) {
    tagsNode = {
      type: "tag",
      value: tagsQuery,
    } satisfies TagNode;
  }

  const min = minWeightQuery ? +minWeightQuery : null;
  const max = maxWeightQuery ? +maxWeightQuery : null;

  if (min !== null && max !== null) {
    weightNode = {
      type: "weight",
      value: {
        type: "range",
        min,
        minIncluded: true,
        max,
        maxIncluded: true,
      },
    };
  } else if (min !== null) {
    weightNode = {
      type: "weight",
      value: {
        type: "range",
        min,
        minIncluded: true,
      },
    };
  } else if (max !== null) {
    weightNode = {
      type: "weight",
      value: {
        type: "range",
        max,
        maxIncluded: true,
      },
    };
  }

  if (tagsNode && weightNode) {
    return {
      type: "intersection",
      child1: tagsNode,
      child2: weightNode,
    } satisfies IntersectionNode;
  }

  if (tagsNode)
    return tagsNode;

  if (weightNode)
    return weightNode;

  return null;
}
