/* eslint-disable jest/no-export */
import { RequestMethod } from "@nestjs/common";
import { routeModules } from "#main/routes";
import { createTestingAppModuleAndInit, TestingSetup } from "#tests/nestjs/app";
import { getRoutes, GotRoute } from "./get";

let testingSetup: TestingSetup;
let routes: GotRoute[];

type Options = {
  httpMethod: RequestMethod;
};
export function testRoute(url: string, options?: Options) {
  const httpMethod = options?.httpMethod ?? RequestMethod.GET;

  it(`should exists global app path: ${requestMethodToString(httpMethod)} ${url}`, async () => {
    if (!testingSetup)
      await init();

    const matchingRoute = findMatchingRoute(url, httpMethod);

    try {
      expect(matchingRoute).toBeDefined();
    } catch (e) {
      console.log(routes);
      throw e;
    }
  } );
}

async function init() {
  testingSetup = await createTestingAppModuleAndInit( {
    imports: [
      ...routeModules,
    ],
  } );

  routes = getRoutes(testingSetup.routerApp);
}

const findMatchingRoute = (targetPath: string, targetMethod: RequestMethod) => {
  return routes.find(route => {
    const pathMatches = route.regex.test(targetPath);
    const methodMatches = route.httpMethod === targetMethod;

    return pathMatches && methodMatches;
  } );
};

function requestMethodToString(method: RequestMethod): string {
  switch (method) {
    case RequestMethod.GET:
      return "GET";
    case RequestMethod.POST:
      return "POST";
    case RequestMethod.PUT:
      return "PUT";
    case RequestMethod.DELETE:
      return "DELETE";
    case RequestMethod.PATCH:
      return "PATCH";
    case RequestMethod.HEAD:
      return "HEAD";
    case RequestMethod.OPTIONS:
      return "OPTIONS";
    case RequestMethod.ALL:
      return "ALL";
    default:
      throw new Error(`Método HTTP no reconocido: ${method}`);
  }
}
