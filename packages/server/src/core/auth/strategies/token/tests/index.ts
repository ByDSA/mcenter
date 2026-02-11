/* eslint-disable jest/no-export */
import { UserPayload } from "$shared/models/auth";
import { Application } from "express";
import request from "supertest";
import { TestingSetup } from "#core/app/tests/app";

interface TokenTestConfig {
  url: string;
  validToken?: string;
  expectedUser: UserPayload;
  getRouter: ()=> Application;
  getTestingSetup: ()=> TestingSetup;
}

export function createTokenTests(config: TokenTestConfig) {
  const { getRouter,
    getTestingSetup,
    expectedUser, url, validToken = expectedUser.id } = config;

  describe("token", () => {
    it("should parse user with valid token", async () => {
      const finalUrl = addParams(url, {
        token: validToken,
      } );

      await request(getRouter()).get(finalUrl);

      const { afterGuards } = getTestingSetup().controllers.getCapturedData();

      // Si devuelve undefined, no está llamando al controller y puede estar mal la url
      expect(afterGuards).toBeDefined();
      expect(afterGuards!.user).toBeTruthy();
      expect(afterGuards!.user!.id).toBe(config.expectedUser.id);
    } );

    it("should not parse user with invalid token", async () => {
      const finalUrl = addParams(url, {
        token: "qwerty",
      } );

      await request(getRouter()).get(finalUrl);

      const { afterGuards } = getTestingSetup().controllers.getCapturedData();

      expect(afterGuards?.user ?? null).toBeNull();
    } );
  } );
}

function addParams(
  url: string,
  params: Record<string, boolean | number | string | null | undefined>,
): string {
  const isAbsolute = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
  const base = isAbsolute ? undefined : "http://dummy";
  const u = new URL(url, base);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null)
      u.searchParams.set(key, String(value));
  } );

  // Si era relativa, quitamos el origen fake
  return isAbsolute
    ? u.toString()
    : u.pathname + (u.search ? u.search : "") + (u.hash || "");
}

export function expectControllerCalled(testingSetup: TestingSetup) {
  const { pipeValidations, error } = testingSetup.controllers.getCapturedData();

  expect(error).toBeUndefined();
  expect(pipeValidations?.completed).toBeTruthy();
}

export function expectControllerNotCalled(testingSetup: TestingSetup) {
  const { error, pipeValidations } = testingSetup.controllers.getCapturedData();

  expect(pipeValidations?.completed).toBeFalsy();
  expect(error).toBeDefined();
}
