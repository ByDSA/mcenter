import { NextFunction, Request, Response, Router } from "express";

const MATCHERS = [
  "all",
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
];

export default function SecureRouter(): Router {
  const router: any = Router();

  for (const matcher of MATCHERS) {
    const old = router[matcher].bind(router);

    router[matcher] = (path: any, ...handlers: any[]) => old(path, ...handlers.map(tryCatch));
  }

  return router;
}

function tryCatch(fn: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (e) {
      next(e);
    }
  };
}