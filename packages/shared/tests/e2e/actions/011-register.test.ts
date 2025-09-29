import { test, expect } from "@playwright/test";
import { PATH_ROUTES } from "../../../src/routing";
import { fixtureAuthLocal } from "../../../src/models/auth/tests/auth-local-fixtures";
import { frontEndUrl, MatchUrlError, sleep } from "../utils";
import { expectLoggedAuthCookie, expectNotLoggedAuthCookie } from "../auth-cookies";
import { fixtureUsers } from "../../../src/models/auth/tests/fixtures";
import { localRegisterAction, oauthLoginMockAction, oauthRegisterMockAction } from "./register";
import { validateEmailAction } from "./validate-email";
import { localLoginAction } from "./login";

test.describe("register local", () => {
  test("register local ok", async ( { page } ) => {
    const email = "new@mail.com";
    const { response } = await localRegisterAction( {
      page,
      email,
      password: "123456",
      username: "newUsername",
      lastname: "Last Name",
      name: "Full Name",
    } );

    expect(response?.status()).toBe(200);

    // Comprobar que se haya ido a la url "/"
    await page.waitForURL(frontEndUrl(`auth/register/done?email=${email}`), {
      timeout: 5_000,
    } );

    await expectNotLoggedAuthCookie( {
      page,
    } );
  } );

  test("register twice should fail", async ( { page } ) => {
    const email = "new2@mail.com";

    for (let i = 0; i < 2; i++) {
      const responsePromise = page.waitForResponse(response => response.url().includes(
        PATH_ROUTES.auth.local.signup.path,
      ), {
        timeout: 3_000,
      } );
      let failed: boolean;

      try {
        failed = false;
        await localRegisterAction( {
          page,
          email,
          password: "123456",
          username: "newUsername2",
          lastname: "Last Name",
          name: "Full Name",
        } );
      } catch (e) {
        failed = true;

        if (i !== 1)
          throw e;
      }

      const response = await responsePromise;

      if (i === 0)
        expect(response.status()).not.toBe(409);
      else {
        expect(failed).toBeTruthy();
        expect(response.status()).toBe(409);
      }
    }
  } );

  test("validation ok", async ( { page } ) => {
    const username = "newUsernameToValidate";

    await localRegisterAction( {
      page,
      email: "newToValidate@mail.com",
      password: "123456",
      username,
      lastname: "Last Name",
      name: "Full Name",
    } );

    await sleep(500);

    await validateEmailAction( {
      page,
      username: username,
    } );

    await page.waitForURL(frontEndUrl("/"), {
      timeout: 5_000,
    } );

    await expectLoggedAuthCookie( {
      page,
    } );
  } );
} );

test("register after login should fail", async ( { page } ) => {
  await localLoginAction( {
    page,
    usernameOrEmail: fixtureUsers.Normal.User.email,
    password: fixtureAuthLocal.Normal.password,
  } );
  const email = "registerAfterLogin@mail.com";
  let error: unknown;

  try {
    await localRegisterAction( {
      page,
      email,
      password: "123456",
      username: "registerAfterLogin",
      lastname: "Last Name",
      name: "Full Name",
    } );
  } catch (e) {
    error = e;
  }

  expect(error instanceof MatchUrlError).toBeTruthy();
} );

test.describe("oauth (mock)", ()=> {
  test("register", async ( { page } ) => {
    await oauthRegisterMockAction( {
      page,
      user: {
        email: "newOauth@mail.com",
        firstName: "oauth",
        lastName: "register",
      },
    } );
  } );

  test("register twice should return same user", async ( { page } ) => {
    const email = "newOauthTwice@mail.com";
    const firstName = "Oauth";
    const lastName = "Twice";
    const { result: r1 } = await oauthRegisterMockAction( {
      page,
      user: {
        email,
        firstName,
        lastName,
      },
    } );
    const userId1 = r1.user.id;
    const { result: r2 } = await oauthRegisterMockAction( {
      page,
      user: {
        email,
        firstName: firstName + "2",
        lastName: lastName + "2",
      },
    } );
    const userId2 = r2.user.id;

    expect(userId1).toBe(userId2);
    expect(r2.user.firstName).toBe(firstName);
    expect(r2.user.lastName).toBe(lastName);
  } );
} );

test(
  "register local + register oauth before verification should let login with oauth but not \
with local",
  async ( { page } ) => {
    const email = "local+oauth@mail.com";
    const password = "123456";

    await localRegisterAction( {
      page,
      email,
      username: "local+oauth",
      password,
    } );

    await oauthRegisterMockAction( {
      page,
      user: {
        email,
        firstName: "Local",
        lastName: "+Oauth",
      },
    } );

    let error: unknown;

    try {
      await localLoginAction( {
        page,
        usernameOrEmail: email,
        password,
      } );
    } catch (e) {
      error = e;
    }

    await oauthLoginMockAction( {
      page,
      email,
    } );

    expect(error).toBeDefined();
  },
);

test(
  "register oauth + register local should let login with oauth but not \
  with local",
  async ( { page } ) => {
    const email = "oauth+local@mail.com";
    const password = "123456";

    await oauthRegisterMockAction( {
      page,
      user: {
        email,
        firstName: "Oauth",
        lastName: "+local",
      },
    } );
    let error: unknown;

    await localRegisterAction( {
      page,
      email,
      username: "oauth+local",
      password,
    } );

    try {
      await localLoginAction( {
        page,
        usernameOrEmail: email,
        password,
      } );
    } catch (e) {
      error = e;
    }

    await oauthLoginMockAction( {
      page,
      email,
    } );

    expect(error).toBeDefined();
  },
);
