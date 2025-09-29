import { expect } from "@playwright/test";
import { PATH_ROUTES } from "src/routing";
import { assertIsDefined } from "src/utils/validation";
import { backendUrl, frontEndUrl } from "../utils";
import { Action } from "./Action";

type Props = {
  username: string;
};
export const validateEmailAction: Action<Props> = async (
  { page, username },
) => {
  const verificationTokenRes = await fetch(
    backendUrl(PATH_ROUTES.tests.verificationToken.get.withParams(username)),
  );
  const verificationToken = await verificationTokenRes.text() || null;

  expect(verificationToken).toBeDefined();

  assertIsDefined(verificationToken);

  await page.goto(
    frontEndUrl(PATH_ROUTES.auth.frontend.emailVerification.verify.withParams(verificationToken)),
  );
};
