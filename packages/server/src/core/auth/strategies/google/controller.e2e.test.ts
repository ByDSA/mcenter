import { Server } from "http";
import { APIRequestContext, request } from "playwright";
import { Application } from "express";
import { PATH_ROUTES } from "$shared/routing";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";

declare global {
  var apiRequest: APIRequestContext;
}

beforeAll(async () => {
  // Solo cliente HTTP, sin navegadores
  global.apiRequest = await request.newContext();
}, 30000);

afterAll(async () => {
  await global.apiRequest?.dispose();
} );

describe("googleController", () => {
  let baseURL: string;
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let server: Server;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [],
      providers: [],
    }, {
      auth: {
        repositories: "normal",
      },
    } );
    routerApp = testingSetup.routerApp;

    const TEST_PORT = 3333;

    await new Promise<void>((resolve) => {
      routerApp.listen(TEST_PORT, () => {
        resolve();
      } );
    } );

    baseURL = `http://localhost:${TEST_PORT}`;
  } );

  afterAll(async () => {
    if (server!) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      } );
    }
  } );

  it("should redirect to google login page", async () => {
    const response = await global.apiRequest.get(`${baseURL}${PATH_ROUTES.auth.google.login.path}`);

    expect(response.status()).toBe(200);

    const responseBody = await response.text();

    expect(responseBody).toContain("https://accounts.google.com/");
  } );

  it("should show current OAuth config", async () => {
    const response = await global.apiRequest.get(
      `${baseURL}${PATH_ROUTES.auth.google.login.path}`,
      {
        maxRedirects: 0,
      },
    );

    expect(response.status()).toBe(302);

    const { location } = response.headers();
    const url = new URL(location);

    expect(url.searchParams.get("client_id")).toBe(process.env.AUTH_GOOGLE_CLIENT_ID);
    expect(url.searchParams.get("redirect_uri")).toBe(process.env.AUTH_GOOGLE_CALLBACK_URL);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("email profile");
  } );
} );
