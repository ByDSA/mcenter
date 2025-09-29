import { test } from "@playwright/test";
import { expect } from "@playwright/test";
import { fixtureUsers } from "../../../src/models/auth/tests/fixtures";
import { fixtureAuthLocal } from "../../../src/models/auth/tests/auth-local-fixtures";
import { expectLoggedAuthCookie } from "../auth-cookies";
import { MatchUrlError } from "../utils";
import { localLoginAction } from "./login";
import { oauthLoginMockAction, oauthRegisterMockAction } from "./register";

test("login local", async ( { page } ) => {
  const { response } = await localLoginAction( {
    page,
    usernameOrEmail: fixtureUsers.Normal.User.email,
    password: fixtureAuthLocal.Normal.password,
  } );

  expect(response?.status()).toBe(200);

  await expectLoggedAuthCookie( {
    page,
  } );
} );

test("login oauth", async ( { page } ) => {
  const email = "login-oauth@mail.com";

  await oauthRegisterMockAction( {
    page,
    user: {
      email,
      firstName: "Login",
      lastName: "Oauth",
    },
  } );
  await oauthLoginMockAction( {
    page,
    email,
  } );

  await expectLoggedAuthCookie( {
    page,
  } );
} );

test("login local twice should fail", async ( { page } ) => {
  await localLoginAction( {
    page,
    usernameOrEmail: fixtureUsers.Normal.User.email,
    password: fixtureAuthLocal.Normal.password,
  } );

  let error: unknown;

  try {
    await localLoginAction( {
      page,
      usernameOrEmail: fixtureUsers.Normal.User.email,
      password: fixtureAuthLocal.Normal.password,
    } );
  } catch (e) {
    error = e;
  }

  expect(error instanceof MatchUrlError).toBeTruthy();
} );
