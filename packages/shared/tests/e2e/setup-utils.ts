import { backendUrl } from "./utils";

// Funciones de colores simples usando códigos ANSI
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

// Función reutilizable (si la necesitas en otros lugares)
export async function setupFixtures(): Promise<void> {
  console.log(blue("🗂️  Setting up test fixtures..."));

  const FIXTURES_ENDPOINT = backendUrl("/tests/db/fixtures/reset");

  try {
    const response = await fetch(FIXTURES_ENDPOINT);

    if (!response.ok)
      throw new Error(`Fixtures setup failed: ${response.status}`);

    console.log(green("✅ Test fixtures ready"));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(red("❌ Failed to setup fixtures:"), errorMessage);
    console.log("URL:", FIXTURES_ENDPOINT);
    throw error;
  }
}
