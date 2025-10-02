import { Application } from "express";
import request, { Response } from "supertest";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { fixtureAuthLocal } from "$sharedSrc/models/auth/tests/auth-local-fixtures";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { createLoginRequest } from "../strategies/local/tests/requests";
import { WithAuthController } from "./with-auth.controller";

describe("auth controller", () => {
  let testingSetup: TestingSetup;
  let loginRequest: ReturnType<typeof createLoginRequest>;
  let routerApp: Application;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [],
      controllers: [WithAuthController],
      providers: [],
    }, {
      auth: {
        using: "mock",
      },
    } );
    routerApp = testingSetup.routerApp;
    loginRequest = createLoginRequest( {
      routerApp: testingSetup.routerApp,
    } );
  } );

  describe("no logged tests", () => {
    let agent: ReturnType<typeof request.agent>;

    beforeAll(()=> {
      agent = request.agent(routerApp);
    } );

    it("should show unlogged info", async () => {
      const root = await agent.get("/");

      expect(root.text).toContain("no iniciada");
    } );

    it("should access", async () => {
      const root = await agent.get("/guest");

      expect(root.statusCode).toBe(HttpStatus.OK);
    } );

    it("should not access to logged", async () => {
      const root = await agent.get("/logged");

      expect(root.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    } );

    it("should not access to user", async () => {
      const root = await agent.get("/user");

      expect(root.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    } );

    it("should not access to admin", async () => {
      const root = await agent.get("/admin");

      expect(root.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    } );
  } );

  describe("logged normal user tests", () => {
    let loginRes: Response;
    let agent: ReturnType<typeof request.agent>;

    beforeAll(async ()=> {
      agent = request.agent(routerApp);

      loginRes = await loginRequest( {
        agent,
        dto: {
          usernameOrEmail: fixtureAuthLocal.Normal.userPass.username,
          password: fixtureAuthLocal.Normal.password,
        },
      } );
    } );

    it("valid login response", () => {
      expect(loginRes.body.data).toBeTruthy();
    } );

    it("should show user info", async () => {
      const root = await agent.get("/");

      expect(root.text).toContain(fixtureUsers.Normal.User.publicName);
    } );

    it("should not access to guest", async () => {
      const root = await agent.get("/guest");

      expect(root.statusCode).toBe(HttpStatus.FORBIDDEN);
    } );

    it("should access to logged", async () => {
      const root = await agent.get("/logged");

      expect(root.statusCode).toBe(HttpStatus.OK);
    } );

    it("should access to user", async () => {
      const root = await agent.get("/user");

      expect(root.statusCode).toBe(HttpStatus.OK);
    } );

    it("should not access to admin", async () => {
      const root = await agent.get("/admin");

      expect(root.statusCode).toBe(HttpStatus.FORBIDDEN);
    } );
  } );

  describe("logged admin tests", () => {
    let loginRes: Response;
    let agent: ReturnType<typeof request.agent>;

    beforeAll(async ()=> {
      agent = request.agent(routerApp);

      loginRes = await loginRequest( {
        agent,
        dto: {
          usernameOrEmail: fixtureAuthLocal.Admin.userPass.username,
          password: fixtureAuthLocal.Admin.password,
        },
      } );
    } );

    it("valid login response", () => {
      expect(loginRes.body.data).toBeTruthy();
    } );

    it("should show user info", async () => {
      const root = await agent.get("/");

      expect(root.text).toContain(fixtureUsers.Admin.User.publicName);
    } );

    it("should not access to guest", async () => {
      const root = await agent.get("/guest");

      expect(root.statusCode).toBe(HttpStatus.FORBIDDEN);
    } );

    it("should access to logged", async () => {
      const root = await agent.get("/logged");

      expect(root.statusCode).toBe(HttpStatus.OK);
    } );

    it("should access to user", async () => {
      const root = await agent.get("/user");

      expect(root.statusCode).toBe(HttpStatus.OK);
    } );

    it("should access to admin", async () => {
      const root = await agent.get("/admin");

      expect(root.statusCode).toBe(HttpStatus.OK);
    } );
  } );
} );
