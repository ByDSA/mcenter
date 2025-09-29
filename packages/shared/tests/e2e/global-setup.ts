import { setupFixtures } from "./setup-utils";

// eslint-disable-next-line import/no-default-export
export default async function globalSetup(): Promise<void> {
  await setupFixtures();
}
