import { Request } from "express";
import { parseQuery } from "./1-str-to-obj/query-parser";
import { ExpressionNode } from "./query-object";

export function requestToFindMusicParams(req: Request): ExpressionNode | null {
  const query = <string | undefined>req.query.q;

  if (!query)
    return null;

  return parseQuery(query).root;
}
