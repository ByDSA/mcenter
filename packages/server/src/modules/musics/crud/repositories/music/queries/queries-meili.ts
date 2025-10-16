import { ExpressionNode, RangeDate, RangeNumber } from "./query-object";

export function expressionToMeilisearchQuery(expression: ExpressionNode): string {
  switch (expression.type) {
    case "year":
    {
      const value1 = expression.value;

      if (value1.type === "number")
        return "year = " + value1.value;
      else if (value1.type === "range")
        return rangeNumberToMeili("year", value1);
      else
        throw new Error("Year: unexpected value type: " + (value1 as any).type);
    }
    case "played":
    {
      const { value } = expression;

      if (value.type === "range-date")
        return rangeDateToMeili("lastTimePlayedAt", value);
      else
        throw new Error("Played: unexpected value type: " + (value as any).type);
    }
    case "added":
    {
      const { value } = expression;

      if (value.type === "range-date")
        return rangeDateToMeili("addedAt", value);
      else
        throw new Error("Added: unexpected value type: " + (value as any).type);
    }
    case "weight":
    {
      const value1 = expression.value;

      if (value1.type === "number")
        return "weight = " + value1.value;
      else if (value1.type === "range")
        return rangeNumberToMeili("weight", value1);
      else
        throw new Error("Weight: unexpected value type: " + (value1 as any).type);
    }
    case "tag":
    {
      const tag = expression.value;

      return `(tags IN ["${tag}"] AND onlyTags IS NULL) OR onlyTags IN ["${tag}"]`;
    }
    case "union":
    {
      const { child1, child2 } = expression;
      const qChild1 = expressionToMeilisearchQuery(child1);
      const qChild2 = expressionToMeilisearchQuery(child2);

      return `(${qChild1}) OR (${qChild2})`;
    }
    case "intersection":
    {
      const { child1, child2 } = expression;
      const qChild1 = expressionToMeilisearchQuery(child1);
      const qChild2 = expressionToMeilisearchQuery(child2);

      return `(${qChild1}) AND (${qChild2})`;
    }
    case "complement":
    case "difference":
    default:
      throw new Error("Not implemented for Meilisearch: " + expression.type);
  }
}

function rangeNumberToMeili(key: string, range: RangeNumber): string {
  let maxPart: string | undefined;
  let minPart: string | undefined;

  if ("max" in range) {
    if (range.maxIncluded)
      maxPart = `${key} <= ${range.max}`;
    else
      maxPart = `${key} < ${range.max}`;
  }

  if ("min" in range) {
    if (range.minIncluded)
      minPart = `${key} >= ${range.min}`;
    else
      minPart = `${key} > ${range.min}`;
  }

  if (minPart && !maxPart)
    return minPart;

  if (!minPart && maxPart)
    return maxPart;

  if (!minPart || !maxPart)
    throw new Error("Unexpected error in range processing");

  return minPart + " AND " + maxPart;
}
function rangeDateToMeili(key: string, range: RangeDate): string {
  let maxPart: string | undefined;
  let minPart: string | undefined;

  if ("max" in range) {
    if (range.maxIncluded)
      maxPart = `${key} <= ${dateToTimestamp(range.max)}`;
    else
      maxPart = `${key} < ${dateToTimestamp(range.max)}`;
  }

  if ("min" in range) {
    if (range.minIncluded)
      minPart = `${key} >= ${dateToTimestamp(range.min)}`;
    else
      minPart = `${key} > ${dateToTimestamp(range.min)}`;
  }

  if (minPart && !maxPart)
    return minPart;

  if (!minPart && maxPart)
    return maxPart;

  if (!minPart || !maxPart)
    throw new Error("Unexpected error in range processing");

  return minPart + " AND " + maxPart;
}

function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
