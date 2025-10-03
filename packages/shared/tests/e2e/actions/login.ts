import { Response, expect } from "@playwright/test";
import { PATH_ROUTES } from "src/routing";
import { expectPageUrl, frontEndUrl, safeFillInput, safeGoto } from "../utils";
import { Action } from "./Action";

type Props = {
  usernameOrEmail: string;
  password: string;
};
type Ret = {
  response: Response | null;
};
export const localLoginAction: Action<Props, Ret> = async ( { page,
  usernameOrEmail,
  password } ) => {
  const url = frontEndUrl(PATH_ROUTES.auth.frontend.login.path);
  const response = await safeGoto(page, url);

  expectPageUrl( {
    page,
    url,
  } );

  await expect(page.getByText("Login").last()).toBeVisible();

  // Si se usa fill, en webkit falla
  await safeFillInput( {
    locator: page.getByPlaceholder(/(email)|(user)/i),
    text: usernameOrEmail,
    page,
  } );

  await page.getByPlaceholder(/(pass)|(contraseña)/i).fill(password);

  const button = page.getByText("Iniciar");

  expect(await button.isEnabled()).toBe(true);

  await button.click();

  await page.waitForFunction(
    // eslint-disable-next-line no-undef
    (prevUrl) => !window.location.href.includes(prevUrl),
    frontEndUrl(PATH_ROUTES.auth.frontend.login.path),
    {
      timeout: 3_000,
    },
  );

  return {
    response,
  };
};
