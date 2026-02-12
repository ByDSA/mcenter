/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-export */
import { UserPayload } from "$shared/models/auth";
import request from "supertest";
import { throwErrorPopStack } from "$shared/utils/errors";
import { HttpStatus } from "@nestjs/common";
import { fixtureUsers } from "$shared/models/auth/tests/fixtures";
import { getCurrentTestingSetup, TestingSetup } from "#core/app/tests/app";
import { Phase } from "#core/app/tests/controllers/capture-args.interceptor";

interface TokenTestConfig {
  url: string;
  validToken?: string;
  expectedUser: UserPayload;
}

export function createTokenTests(config: TokenTestConfig) {
  const { expectedUser, url, validToken = expectedUser.id } = config;

  describe("token", () => {
    it("should parse user with valid token", async () => {
      const finalUrl = addParams(url, {
        token: validToken,
      } );
      const testingSetup = getCurrentTestingSetup();

      await request(testingSetup.routerApp).get(finalUrl);

      const { afterGuards } = testingSetup.controllers.getCapturedData();

      // Si devuelve undefined, no está llamando al controller y puede estar mal la url
      expect(afterGuards).toBeDefined();
      expect(afterGuards!.user).toBeTruthy();
      expect(afterGuards!.user!.id).toBe(config.expectedUser.id);
    } );

    it("should not parse user with invalid token", async () => {
      const finalUrl = addParams(url, {
        token: "qwerty",
      } );
      const testingSetup = getCurrentTestingSetup();

      await request(testingSetup.routerApp).get(finalUrl);

      const { afterGuards } = testingSetup.controllers.getCapturedData();

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

export function expectControllerFinishRequest() {
  try {
    expectControllerMinPhase(Phase.finished);
  } catch (e) {
    if (!(e instanceof Error))
      throw e;

    throwErrorPopStack(e, 1);
  }
}

export function expectControllerFailRequest() {
  try {
    expectControllerMaxPhase(Phase.afterController);
  } catch (e) {
    if (!(e instanceof Error))
      throw e;

    throwErrorPopStack(e, 1);
  }
}

type ExpectControllerFailInPhaseOptions = {
  validationInController?: boolean;
};

export function expectControllerFailInValidationPhase(
  options?: ExpectControllerFailInPhaseOptions,
) {
  try {
    expectControllerMinPhase(Phase.guard);

    if (options?.validationInController)
      expectControllerMaxPhase(Phase.controller);
    else
      expectControllerMaxPhase(Phase.dtoValidation);
  } catch (e) {
    if (!(e instanceof Error))
      throw e;

    throwErrorPopStack(e, 1);
  }
}

export function expectControllerMinPhase(phase: Phase) {
  const { currentPhase, error } = getCurrentTestingSetup().controllers.getCapturedData();

  if (currentPhase < phase) {
    const currentPhaseName = Phase[currentPhase];
    const expectedPhaseName = Phase[phase];
    let errorMessage = error?.message;

    try {
      if (errorMessage)
        errorMessage = JSON.stringify(JSON.parse(errorMessage), null, 2);
    } catch { /* empty */ }

    throwErrorPopStack(new Error(
      "Controller phase is too low.\n"
      + `Expected at least: ${expectedPhaseName} (${phase})\n`
      + `Received: ${currentPhaseName} (${currentPhase})\n`
      + `Error:\n${errorMessage}`,
    ), 1);
  }
}

export function expectControllerPhase(
  testingSetup: TestingSetup,
  phase: Phase,
) {
  const { currentPhase, error } = testingSetup.controllers.getCapturedData();

  if (currentPhase !== phase) {
    const currentPhaseName = Phase[currentPhase];
    const expectedPhaseName = Phase[phase];
    let errorMessage = error?.message;

    try {
      if (errorMessage)
        errorMessage = JSON.stringify(JSON.parse(errorMessage), null, 2);
    } catch { /* empty */ }

    throwErrorPopStack(new Error(
      "Controller phase is not as expected.\n"
      + `Expected: ${expectedPhaseName} (${phase})\n`
      + `Received: ${currentPhaseName} (${currentPhase})\n`
      + `Error:\n${errorMessage}`,
    ), 1);
  }
}

export function expectControllerMaxPhase(phase: Phase) {
  const { currentPhase, error } = getCurrentTestingSetup().controllers.getCapturedData();

  if (currentPhase > phase) {
    const currentPhaseName = Phase[currentPhase];
    const expectedPhaseName = Phase[phase];
    let errorMessage = error?.message;

    try {
      if (errorMessage)
        errorMessage = JSON.stringify(JSON.parse(errorMessage), null, 2);
    } catch { /* empty */ }

    throwErrorPopStack(new Error(
      "Controller phase is too hight.\n"
      + `Expected at max: ${expectedPhaseName} (${phase})\n`
      + `Received: ${currentPhaseName} (${currentPhase})\n`
      + `Error:\n${errorMessage}`,
    ), 1);
  }
}

function stringifyUser(user: UserPayload): string {
  if (user === fixtureUsers.Normal.UserWithRoles)
    return "Normal";

  if (user === fixtureUsers.Admin.UserWithRoles)
    return "Admin";

  return "Custom";
}

type TestAuthOptions = {
  user?: UserPayload | null;
  shouldPass: boolean;
  request: ()=> Promise<request.Response>;
  validationInController?: boolean;
};
export function testAuth(options: TestAuthOptions) {
  const { user = null, shouldPass } = options;
  const userPartName = user ? ("with user " + stringifyUser(user)) : "without user";

  if (shouldPass) {
    it(`request ${userPartName} should pass`, async () => {
      await getCurrentTestingSetup().useMockedUser(user);
      await options.request();

      expectControllerMinPhase(Phase.controller);
    } );
  } else {
    it(`request ${userPartName} should fail`, async () => {
      await getCurrentTestingSetup().useMockedUser(user);
      const res = await options.request();

      if (options.validationInController) {
        expectControllerMinPhase(Phase.guard);
        expectControllerMaxPhase(Phase.controller);
      } else
        expectControllerFailInValidationPhase();

      if (user)
        expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      else
        expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    } );
  }
}

type TestManyAuthOptions = Pick<TestAuthOptions, "validationInController"> & {
  request: (user: UserPayload | null)=> Promise<request.Response>;
  list: {user: UserPayload | null;
shouldPass: boolean;}[];
};
export function testManyAuth(options: TestManyAuthOptions) {
  for (const { user, shouldPass } of options.list) {
    testAuth( {
      user,
      request: () => options.request(user),
      shouldPass,
      validationInController: options.validationInController,
    } );
  }
}

type TestValidationOptions = ExpectControllerFailInPhaseOptions & {
  request: ()=> Promise<request.Response>;
  shouldPass: boolean;
  user?: UserPayload | null;
};

export function testValidation(name: string, options: TestValidationOptions) {
  const { shouldPass, user } = options;

  if (shouldPass) {
    it(`request with valid "${name}" should pass`, async () => {
      if (user !== undefined)
        await getCurrentTestingSetup().useMockedUser(user);

      await options.request();

      expectControllerMinPhase(Phase.controller);
    } );
  } else {
    it(`request with invalid "${name}" should fail`, async () => {
      if (user !== undefined)
        await getCurrentTestingSetup().useMockedUser(user);

      const res = await options.request();

      expectControllerFailInValidationPhase();

      expect(res.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    } );
  }
}

export function testFailValidation(
  name: string,
  options: Omit<TestValidationOptions, "shouldPass">,
) {
  testValidation(name, {
    ...options,
    shouldPass: false,
  } );
}
