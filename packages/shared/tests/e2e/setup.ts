import { test } from "@playwright/test";
import { setupFixtures } from "./setup-utils";

// Test que ejecuta el setup
test("setup fixtures", async () => {
  await setupFixtures();
} );
