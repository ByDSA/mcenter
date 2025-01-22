import { Router } from "express";
import { Component } from "./common";

type RouteListEntryRouter = {
  path: string;
  router: Router;
};

type RouteListEntryRoute = {
  path: string;
  handler: (req: Request, res: Response)=> void;
};

type RouteListEntry = RouteListEntryRoute | RouteListEntryRouter;
type RouteList = RouteListEntry[];
type RoutesOptions = {
  list: RouteList;
};

export type RoutesComponent = Component<RoutesOptions>;
