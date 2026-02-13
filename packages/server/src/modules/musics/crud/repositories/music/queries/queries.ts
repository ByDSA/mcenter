import { parseQuery } from "./1-str-to-obj/query-parser";
import { ExpressionNode } from "./query-object";

export function queryToExpressionNode(query: string): ExpressionNode {
  return parseQuery(query).root;
}
