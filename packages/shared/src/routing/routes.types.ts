type GetPath = (...args: any[])=> string;

type TerminalRoute = {
  readonly path: string;
  readonly withParams: GetPath;
} | {
  readonly path: string;
} | {
  withParams: GetPath;
};

type RouteConfig =
  TerminalRoute | {
      [key: string]: RouteConfig;
    } | TerminalRoute & {
      [key: string]: RouteConfig;
    };

export type PathRoutes = {
  [key: string]: RouteConfig;
};
