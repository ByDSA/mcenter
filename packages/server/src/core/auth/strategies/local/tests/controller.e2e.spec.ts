import request from "supertest";
import { Application } from "express";
import { HttpStatus } from "@nestjs/common";
import { fixtureAuthLocal } from "$sharedSrc/models/auth/tests/auth-local-fixtures";
import z from "zod";
import { AuthCrudDtos } from "$shared/models/auth/dto/transport";
import { createTestingAppModuleAndInit, TestingSetup } from "#core/app/tests/app";
import { deleteFixtureAuthUsers, loadFixtureAuthUsers } from "#core/db/tests/fixtures/sets/auth-users";
import { AuthModule } from "../../../module";
import { LoginDto, SignUpDto } from "../dto";
import { createLoginRequest, createSignUpRequest, LoginRequestProps } from "./requests";

describe(AuthModule.name + "", () => {
  let testingSetup: TestingSetup;
  let routerApp: Application;
  let loginRequest: ReturnType<typeof createLoginRequest>;
  let signUpRequest: ReturnType<typeof createSignUpRequest>;

  beforeAll(async () => {
    testingSetup = await createTestingAppModuleAndInit( {
      imports: [AuthModule],
      controllers: [],
      providers: [],
    }, {
      auth: {
        repositories: "normal",
      },
      db: {
        using: "default",
      },
    } );
    routerApp = testingSetup.routerApp;

    loginRequest = createLoginRequest( {
      routerApp,
    } );
    signUpRequest = createSignUpRequest( {
      routerApp,
    } );

    await deleteFixtureAuthUsers();
    await loadFixtureAuthUsers();
  } );

  it("should be defined", () => {
    expect(routerApp).toBeDefined();
  } );

  async function correctLoginRequest(props?: Omit<LoginRequestProps, "dto">) {
    const dto: LoginDto = {
      usernameOrEmail: fixtureAuthLocal.Normal.userPass.username,
      password: fixtureAuthLocal.Normal.password,
    };
    const res = await loginRequest( {
      agent: props?.agent,
      dto,
    } );

    return res;
  }
  async function correctSignUpRequest(props?: Omit<LoginRequestProps, "dto">) {
    const dto: SignUpDto = {
      email: "new-email@mail.com",
      username: "newUsername",
      firstName: "first",
      lastName: "last",
      password: "123456",
    };
    const res = await signUpRequest( {
      agent: props?.agent,
      dto,
    } );

    return res;
  }

  describe("login functionality", () => {
    let res: request.Response;

    beforeAll(async ()=> {
      res = await correctLoginRequest();
    } );

    it("should return OK status code for correct login", () => {
      expect(res.statusCode).toBe(HttpStatus.OK);
    } );

    it("should return valid login response schema for correct login", () => {
      expect(() => AuthCrudDtos.LocalLogin.responseSchema.parse(res.body)).not.toThrow();
    } );

    it("should set auth cookie for correct login", () => {
      expectHasAuthCookie(res);
    } );

    describe("incorrect login", () => {
      let res2: request.Response;

      beforeAll(async () => {
        const dto: LoginDto = {
          usernameOrEmail: "undefined",
          password: "123456",
        };

        res2 = await loginRequest( {
          dto,
        } );
      } );

      it("should return UNAUTHORIZED status code for incorrect login", () => {
        expect(res2.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      } );

      it("should not set auth cookie for incorrect login", () => {
        expectHasNotAuthCookie(res2);
      } );
    } );

    it("should prevent re-login when already authenticated", async () => {
      const agent = request.agent(routerApp);

      await correctLoginRequest( {
        agent,
      } );
      const res2 = await correctLoginRequest( {
        agent,
      } );

      expect(res2.statusCode).toBe(HttpStatus.FORBIDDEN);
    } );
  } );

  describe("sign up functionality", () => {
    let res: request.Response;

    beforeAll(async ()=> {
      res = await correctSignUpRequest();
    } );

    it("should return ACCEPTED status code for correct sign up but not verified", () => {
      expect(res.statusCode).toBe(HttpStatus.ACCEPTED);
    } );

    it("should return valid sign up response schema for correct sign up", () => {
      expect(() => z.object( {} ).parse(res.body)).not.toThrow();
    } );

    it("should set auth cookie after successful sign up", () => {
      expectHasNotAuthCookie(res);
    } );

    it("should prevent sign up with existing username", async () => {
      const dto: SignUpDto = {
        email: "non-existing@mail.com",
        username: "newUsername", // not really new
        firstName: "first",
        lastName: "last",
        password: "123456",
      };
      const res2 = await signUpRequest( {
        dto,
      } );

      expect(res2.statusCode).toBe(HttpStatus.CONFLICT);
    } );

    it("should not throw any error on reuse email because of security", async () => {
      const dto: SignUpDto = {
        email: "new-email@mail.com", // not really new
        username: "asdfgh",
        firstName: "first",
        lastName: "last",
        password: "123456",
      };
      const res2 = await signUpRequest( {
        dto,
      } );

      expect(res2.statusCode).toBe(HttpStatus.ACCEPTED);
    } );

    it("should prevent sign up when already authenticated", async () => {
      const agent = request.agent(routerApp);

      await correctLoginRequest( {
        agent,
      } );
      const res2 = await correctSignUpRequest( {
        agent,
      } );

      expect(res2.statusCode).toBe(HttpStatus.FORBIDDEN);
    } );
  } );
} );

function expectHasAuthCookie(res: request.Response) {
  expect(res.headers["set-cookie"]).toBeDefined();

  const authCookie = getAuthCookie(res);

  expect(authCookie).toBeDefined();
  expect(authCookie).toMatch(/^auth=.+/);
}
function expectHasNotAuthCookie(res: request.Response) {
  const authCookie = getAuthCookie(res);

  expect(authCookie).toBeNull();
}

function getAuthCookie(res: request.Response): string | null {
  const setCookieHeader = res.headers["set-cookie"];

  if (!setCookieHeader)
    return null;

  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader as string[] : [setCookieHeader];
  const authCookie = cookies.find((cookie: string) => cookie.startsWith("auth=")) ?? null;

  return authCookie;
}
