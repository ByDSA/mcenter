import { Response, expect } from "@playwright/test";
import { PATH_ROUTES } from "src/routing";
import { frontEndUrl } from "../utils";
import { Action } from "./Action";

type Props = object;
type Ret = {
  response: Response | null;
};
export const logoutAction: Action<Props, Ret> = async ( { page } ) => {
  const response = await page.goto(frontEndUrl(PATH_ROUTES.auth.frontend.logout.path));

  expect(response?.status()).toBe(200);

  // Esperar a que se redirija a /:
  await page.waitForURL(frontEndUrl("/"), {
    timeout: 1_000,
  } );

  return {
    response,
  };
};
