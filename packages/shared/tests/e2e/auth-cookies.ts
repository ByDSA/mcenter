import { Page, expect } from "@playwright/test";
import { AppPayload } from "../../src/models/auth";

type Props = {
  page: Page;
};
export async function expectLoggedAuthCookie( { page }: Props) {
  const authCookie = await getAuthCookie( {
    page,
  } );

  expect(authCookie?.user).toBeDefined();
}

export async function expectNotLoggedAuthCookie( { page }: Props) {
  const authCookie = await getAuthCookie( {
    page,
  } );

  expect(authCookie?.user).toBeFalsy();
}

export async function getAuthCookie( { page }: Props): Promise<AppPayload | null> {
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((cookie) => cookie.name === "auth");

  if (!authCookie?.value)
    return null;

  try {
    // Decodificar el JWT (parte del payload, que es la segunda parte)
    const parts = authCookie.value.split(".");

    if (parts.length !== 3)
      return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    // Si user es null, consideramos que no hay autenticación válida
    return payload.user ? payload : null;
  } catch {
    return null;
  }
}
