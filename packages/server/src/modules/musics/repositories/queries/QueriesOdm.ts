import { ExpressionNode, OperationNode } from "./QueryObject";

type WeightYear = {
  $gte?: number;
  $gt?: number;
  $lte?: number;
  $lt?: number;
};

export type FindQueryParams = {
  $and?: FindQueryParams[];
  $or?: FindQueryParams[];
  tags?: {
    $in?: string[];
    $all?: string[];
  };
  onlyTags?: {
    $in?: string[];
    $all?: string[];
    $size?: number;
    $exists?: boolean;
  };
  weight?: WeightYear;
  year?: WeightYear;
};

type Props = {
  parentOperation: OperationNode["type"];
};

export function findParamsToQueryParams(params: ExpressionNode, _props?: Props): FindQueryParams {
  const error = new Error("Error");

  switch (params.type) {
    case "tag":
      return {
        $or: [
          {
            $and: [{
              tags: {
                $in: [params.value],
              },
            },
            {
              $or: [{
                onlyTags: {
                  $size: 0,
                },
              },
              {
                onlyTags: {
                  $exists: false,
                },
              }],
            }],
          },
          {
            onlyTags: {
              $in: [params.value],
            },
          },
        ],
      };
    case "weight":
    {
      if (params.value.type === "number")
        throw error;

      const weight = {} as NonNullable<FindQueryParams["weight"]>;

      if ("min" in params.value) {
        if (params.value.minIncluded)
          weight.$gte = params.value.min;
        else
          weight.$gt = params.value.min;
      }

      if ("max" in params.value) {
        if (params.value.maxIncluded)
          weight.$lte = params.value.max;
        else
          weight.$lt = params.value.max;
      }

      return {
        weight,
      };
    }
    case "intersection":
      return intersectionCase(params);
    case "union":
      return unionCase(params);
    case "year":
    {
      if (params.value.type === "number")
        throw error;

      const year = {} as NonNullable<FindQueryParams["year"]>;

      if ("min" in params.value) {
        if (params.value.minIncluded)
          year.$gte = params.value.min;
        else
          year.$gt = params.value.min;
      }

      if ("max" in params.value) {
        if (params.value.maxIncluded)
          year.$lte = params.value.max;
        else
          year.$lt = params.value.max;
      }

      return {
        year,
      };
    }
    case "difference":
    case "complement":
    default: throw error;
  }
}

function intersectionCase(node: ExpressionNode, query: FindQueryParams = {} ): FindQueryParams {
  const operation = "intersection";
  const props = {
    parentOperation: operation,
  } as Props;

  if (node.type === "tag" || node.type === "weight" || node.type === "year")
    return findParamsToQueryParams(node, props);

  if (node.type !== operation)
    throw new Error("error");

  const left = node.child1;
  const right = node.child2;
  const leftQuery = findParamsToQueryParams(left, props);
  const rightQuery = findParamsToQueryParams(right, props);
  const leftRightMerge = {
    $and: [] as FindQueryParams[],
  } satisfies FindQueryParams;

  if (left.type === "intersection" && leftQuery.$and)
    leftRightMerge.$and.push(...leftQuery.$and);
  else
    leftRightMerge.$and.push(leftQuery);

  if (right.type === "intersection" && rightQuery.$and)
    leftRightMerge.$and.push(...rightQuery.$and);
  else
    leftRightMerge.$and.push(rightQuery);

  return mergeQuery(query, leftRightMerge);
}

function unionCase(node: ExpressionNode, query: FindQueryParams = {} ): FindQueryParams {
  const operation = "union";
  const props = {
    parentOperation: operation,
  } as Props;

  if (node.type === "tag" || node.type === "weight" || node.type === "year")
    return findParamsToQueryParams(node, props);

  if (node.type !== operation)
    throw new Error("error");

  const left = node.child1;
  const right = node.child2;
  const leftQuery = findParamsToQueryParams(left, props);
  const rightQuery = findParamsToQueryParams(right, props);
  const leftRightMerge = {
    $or: [] as FindQueryParams[],
  } satisfies FindQueryParams;

  if (left.type === "union" && leftQuery.$or)
    leftRightMerge.$or.push(...leftQuery.$or);
  else
    leftRightMerge.$or.push(leftQuery);

  if (right.type === "union" && rightQuery.$or)
    leftRightMerge.$or.push(...rightQuery.$or);
  else
    leftRightMerge.$or.push(rightQuery);

  return mergeQuery(query, leftRightMerge);
}

function mergeQuery(q1: FindQueryParams, q2: FindQueryParams): FindQueryParams {
  const ret: FindQueryParams = {};
  const error = new Error("Error");

  if (q1.$and && q2.$and)
    ret.$and = [...q1.$and, ...q2.$and];
  else if (q1.$and || q2.$and)
    ret.$and = q1.$and ?? q2.$and;

  if (q1.$or && q2.$or)
    ret.$or = [...q1.$or, ...q2.$or];
  else if (q1.$or || q2.$or)
    ret.$or = q1.$or ?? q2.$or;

  if (q1.tags)
    ret.tags = copyOfTags(q1.tags);

  if (q2.tags) {
    if (!ret.tags)
      ret.tags = {};

    if (q2.tags?.$all) {
      if (ret.tags?.$in)
        throw error;

      if (ret.tags.$all)
        ret.tags.$all.push(...q2.tags.$all);
      else
        ret.tags.$all = q2.tags.$all;
    } else if (q2.tags?.$in) {
      if (ret.tags?.$all)
        throw error;

      if (ret.tags?.$in)
        ret.tags.$in.push(...q2.tags.$in);
      else {
        if (!ret.tags)
          ret.tags = {};

        ret.tags.$in = q2.tags.$in;
      }
    }
  }

  if (q1.weight && q2.weight)
    ret.weight = mergeWeightYear(q1.weight, q2.weight);
  else if (q1.weight || q2.weight)
    ret.weight = q1.weight ?? q2.weight;

  if (q1.year && q2.year)
    ret.year = mergeWeightYear(q1.year, q2.year);
  else if (q1.year || q2.year)
    ret.year = q1.year ?? q2.year;

  return ret;
}

function mergeWeightYear(w1: WeightYear, w2: WeightYear): WeightYear {
  const ret = copyOfWeightYear(w1);
  const error = new Error("Error");

  if (w2.$gt) {
    if (ret.$gt !== undefined)
      throw error;

    ret.$gt = w2.$gt;
  }

  if (w2.$gte) {
    if (w1?.$gte !== undefined)
      throw error;

    ret.$gte = w2.$gte;
  }

  if (w2.$lt) {
    if (w1?.$lt !== undefined)
      throw error;

    ret.$lt = w2.$lt;
  }

  if (w2.$lte) {
    if (w1?.$lte !== undefined)
      throw error;

    ret.$lte = w2.$lte;
  }

  return ret;
}

function copyOfTags(
  tags: NonNullable<FindQueryParams["tags"]>,
): NonNullable<FindQueryParams["tags"]> {
  const ret: FindQueryParams["tags"] = {};

  if (tags.$all)
    ret.$all = [...tags.$all];

  if (tags.$in)
    ret.$in = [...tags.$in];

  return ret;
}

function copyOfWeightYear(input: WeightYear): WeightYear {
  const ret: WeightYear = {};

  if (input.$gt !== undefined)
    ret.$gt = input.$gt;

  if (input.$gte !== undefined)
    ret.$gte = input.$gte;

  if (input.$lt !== undefined)
    ret.$lt = input.$lt;

  if (input.$lte !== undefined)
    ret.$lte = input.$lte;

  return ret;
}
