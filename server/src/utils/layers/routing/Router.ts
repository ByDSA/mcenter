import { Application, Router as ExpressRouter } from "express";
import { neverCase } from "#utils/checking";
import { mergeDeepSameObjects } from "..";
import { GeneralRoute } from "../../express/handlers";
import HttpMethod from "../../http/HttpMethod";

type Params = {
  url: string;
  routes: GeneralRoute[];
};

const DefaultParams: Params = {
  url: "/",
  routes: [],
};

export default class Router {
  private expressRouter: ExpressRouter;

  private url: string;

  protected constructor(params?: Params) {
    const realParams: Params = mergeDeepSameObjects(DefaultParams, params);

    this.url = realParams.url;
    this.expressRouter = ExpressRouter();

    const {routes} = realParams;

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