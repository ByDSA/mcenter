import { Handler, Request, Response } from "express";
import { ArrayOneOrMore } from "src/utils/built-in-types/arrays";
import HttpMethod from "../base/http/HttpMethod";

export type GeneralRoute = {
  method: HttpMethod;
  url: {
    path: string;
  };
  handlers: ArrayOneOrMore<Handler>;
};

export const NOT_IMPLEMENTED_HANDLER: Handler = (req: Request, res: Response) => {
  res.status(501);
  res.send("Method not implemented");
};

export const HELLO_WORLD_HANDLER: Handler = (req: Request, res: Response) => {
  res.status(200);
  res.send("Hello world!");
};

export const HELLO_WORLD_ROUTE: GeneralRoute = {
  method: HttpMethod.GET,
  url: {
    path: "/",
  },
  handlers: [HELLO_WORLD_HANDLER],
};