import { HttpMethod } from "#shared/utils/http/HttpMethod";
import { deepMerge } from "#shared/utils/objects";
import { neverCase } from "#shared/utils/validation";
import { Application, Router as ExpressRouter } from "express";
import { GeneralRoute } from "../../express/handlers";

type Params = {
  url: string;
  routes: GeneralRoute[];
};

const DEFAULT_PARAMS: Params = {
  url: "/",
  routes: [],
};

export class Router {
  private expressRouter: ExpressRouter;

  private url: string;

  protected constructor(params?: Params) {
    const realParams: Params = deepMerge(DEFAULT_PARAMS, params);

    this.url = realParams.url;
    this.expressRouter = ExpressRouter();

    const { routes } = realParams;

    routes.forEach(this.addRoute);
  }

  private addRoute(route: GeneralRoute) {
    switch (route.method) {
      case HttpMethod.GET:
        this.expressRouter.get(route.url.path, ...route.handlers);
        break;
      case HttpMethod.POST:
        this.expressRouter.post(route.url.path, ...route.handlers);
        break;
      case HttpMethod.PUT:
        this.expressRouter.put(route.url.path, ...route.handlers);
        break;
      case HttpMethod.PATCH:
        this.expressRouter.patch(route.url.path, ...route.handlers);
        break;
      case HttpMethod.DELETE:
        this.expressRouter.delete(route.url.path, ...route.handlers);
        break;
      default: neverCase(route.method);
    }
  }

  public addToApp(expressApp: Application) {
    expressApp.use(this.url, this.expressRouter);
  }
}

export function createRouter(params?: Params): Router {
  return new (Router as any)(params);
}
