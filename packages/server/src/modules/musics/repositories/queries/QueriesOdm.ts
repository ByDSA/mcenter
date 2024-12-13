import { FindParams } from "./Queries";

export type FindQueryParams = {
  tags?: {
    $in: string[];
  };
  weight?: {
    $gte?: number;
    $lte?: number;
  };
};

export function findParamsToQueryParams(params: FindParams): FindQueryParams {
  const queryParams: FindQueryParams = {
  };

  if (params.tags) {
    queryParams.tags = {
      $in: params.tags,
    };
  }

  if (params.weight) {
    queryParams.weight = {
    };

    if (params.weight.min !== undefined)
      queryParams.weight.$gte = params.weight.min;

    if (params.weight.max !== undefined)
      queryParams.weight.$lte = params.weight.max;
  }

  return queryParams;
}