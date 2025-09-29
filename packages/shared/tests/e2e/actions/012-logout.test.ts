import { test, expect } from "@playwright/test";
import { fixtureUsers } from "../../../src/models/auth/tests/fixtures";
import { fixtureAuthLocal } from "../../../src/models/auth/tests/auth-local-fixtures";
import { expectNotLoggedAuthCookie } from "../auth-cookies";
import { localLoginAction } from "./login";
import { logoutAction } from "./logout";

test("should logout after login", async ( { page } ) => {
  await localLoginAction( {
    page,
    usernameOrEmail: fixtureUsers.Normal.User.email,
    password: fixtureAuthLocal.Normal.password,
  } );

  await logoutAction( {
    page,
  } );

  await expectNotLoggedAuthCookie( {
    page,
  } );
} );

test("should redirect to '/' in logout without login", async ( { page } ) => {
  await expectNotLoggedAuthCookie( {
    page,
  } );

  const { response } = await logoutAction( {
    page,
  } );

  expect(response?.status()).toBe(200);
} );
