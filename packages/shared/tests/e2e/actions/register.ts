import { expect, Response } from "@playwright/test";
import { User, UserEntityWithRoles } from "src/models/auth";
import { PATH_ROUTES } from "src/routing";
import { WithRequired } from "src/utils/objects";
import { backendUrl, expectPageUrl, frontEndUrl, safeFillInput, safeGoto } from "../utils";
import { Action } from "./Action";

type Props = {
  username: string;
  email: string;
  password: string;
  name?: string;
  lastname?: string;
};
type Ret = {
  response: Response | null;
};
export const localRegisterAction: Action<Props, Ret> = async (
  { page, email, username, lastname, name, password },
) => {
  const url = frontEndUrl(PATH_ROUTES.auth.frontend.register.path);
  const response = await safeGoto(page, url);

  expectPageUrl( {
    page,
    url,
  } );

  const registerLabel = page.getByText("Regístrate");

  await expect(registerLabel).toBeVisible();

  // Si se usa fill, en webkit falla
  await safeFillInput( {
    locator: page.getByPlaceholder(/(usuario)|(user)/i),
    text: username,
    page,
  } );

  const emails = page.getByPlaceholder(/(email)|(mail)/i);

  expect(await emails.count()).toBe(2);

  await emails.first().fill(email);
  await emails.last().fill(email);
  const passes = page.getByPlaceholder(/(pass)|(contraseña)/i);

  expect(await passes.count()).toBe(2);

  await passes.first().fill(password);
  await passes.last().fill(password);

  if (name) {
    await page.getByPlaceholder("nombre").last()
      .fill(name);
  }

  if (lastname) {
    await page.getByPlaceholder("apellidos").last()
      .fill(lastname);
  }

  const button = page.getByText("crear");

  await expect(button).toBeEnabled();

  await button.click();

  await page.waitForFunction(
    // eslint-disable-next-line no-undef
    (path) => window.location.href.includes(path),
    PATH_ROUTES.auth.frontend.register.done.path,
    {
      timeout: 2_000,
    },
  );

  return {
    response,
  };
};
type OauthRegisterProps = {
  user: WithRequired<Omit<User, "emailVerified" | "musics" | "publicName" | "roles" |
    "slug">, "firstName" | "lastName">;
};
type OauthRes = {
  result: {
    user: UserEntityWithRoles;
    status: string;
  };
};
export const oauthRegisterMockAction: Action<OauthRegisterProps, OauthRes> = async (
  { page, user },
) => {
  const response = await page.request.post(backendUrl(PATH_ROUTES.tests.createOauthUser.path), {
    data: {
      user: {
        ...user,
        emailVerified: true,
      } satisfies Omit<User, "musics" | "publicName" | "slug">,
    },
  } );

  if (!response.ok())
    throw new Error(`Failed to create oauth user: ${response.statusText()}`);

  return {
    result: await response.json(),
  };
};

type OauthLoginProps = {
  email: string;
};
export const oauthLoginMockAction: Action<OauthLoginProps, OauthRes> = async (
  { page, email },
) => {
  const response = await page.request.post(backendUrl(PATH_ROUTES.tests.loginOauthUser.path), {
    data: {
      email,
    },
  } );

  if (!response.ok())
    throw new Error(`Failed to create oauth user: ${response.statusText()}`);

  return {
    result: await response.json(),
  };
};
