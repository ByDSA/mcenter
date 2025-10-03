import { test, expect } from "@playwright/test";
import { assertIsDefined } from "../../src/utils/validation";
import { frontEndUrl } from "./utils";

test("homepage loads successfully", async ( { page } ) => {
  const response = await page.goto(frontEndUrl("/"));

  assertIsDefined(response);

  // Verificar que la respuesta sea 200
  expect(response.status()).toBe(200);

  // Bonus: verificar que la página se carga completamente
  await expect(page).toHaveTitle(/.*/, {
    timeout: 5000,
  } );

  // Que contenga el texto "MCenter":
  const el = page.getByText("MCenter").last();

  await expect(el).toBeVisible();
} );
