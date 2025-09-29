import assert from "assert";
import fs from "fs";
import path from "path";
import { Locator, Page } from "@playwright/test";

type Envs = {
  BACKEND_URL?: string;
  FRONTEND_URL?: string;
};

// Función para leer y parsear el archivo .tmp
const loadEnvFromTmp = () => {
  try {
    const projectRoot = process.cwd();
    const tmpFilePath1 = path.join(projectRoot, "tests/e2e/bin/.tmp");
    const tmpFilePath2 = path.join(projectRoot, "bin/.tmp");
    const tmpContent = fs.readFileSync(fs.existsSync(tmpFilePath1)
      ? tmpFilePath1
      : tmpFilePath2, "utf-8");
    // Parsear el contenido como si fuera un archivo .env
    const envVars: Envs = {};

    tmpContent.split("\n").forEach(line => {
      line = line.trim();

      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");

        if (key && valueParts.length > 0) {
          const trimedKey = key.trim() as keyof Envs;

          envVars[trimedKey] = valueParts.join("=").trim();
        }
      }
    } );

    return envVars;
  } catch (error) {
    if (error instanceof Error)
      console.warn("No se pudo leer el archivo ./bin/.tmp, usando valores por defecto:", error.message);

    throw error;
  }
};
// Cargar las variables de entorno
const envVars = loadEnvFromTmp();

assert(!!envVars.BACKEND_URL);
assert(!!envVars.FRONTEND_URL);
const BACKEND_BASE_URL = envVars.BACKEND_URL;
const FRONTEND_BASE_URL = envVars.FRONTEND_URL;

// Funciones exportadas
export const backendUrl = (url: string) => {
  // Remover barras duplicadas
  const cleanUrl = url?.startsWith("/") ? url.slice(1) : url || "";
  const baseUrl = BACKEND_BASE_URL.endsWith("/") ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;

  return `${baseUrl}/${cleanUrl}`;
};

export const frontEndUrl = (url: string) => {
  // Remover barras duplicadas
  const cleanUrl = url?.startsWith("/") ? url.slice(1) : url || "";
  const baseUrl = FRONTEND_BASE_URL.endsWith("/")
    ? FRONTEND_BASE_URL.slice(0, -1)
    : FRONTEND_BASE_URL;

  return `${baseUrl}/${cleanUrl}`;
};

export async function sleep(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function safeGoto(page: Page, ...params: Parameters<Page["goto"]>) {
  if (page.url() !== params[0])
    return await page.goto(...params);

  return null;
}

type SafeFillInputProps = {
  locator: Locator;
  text: string;
  page: Page;
};
export async function safeFillInput( { locator, page, text }: SafeFillInputProps) {
  const browserName = page.context().browser()
    ?.browserType()
    .name();

  if (browserName === "webkit")
    return await locator.pressSequentially(text);
  else
    return await locator.fill(text);
}

type PageUrlProps = {
  page: Page;
  url: string;
};
export function expectPageUrl( { page, url }: PageUrlProps) {
  if (page.url() !== url) {
    throw new MatchUrlError( {
      page,
      url,
    } );
  }
}

export class MatchUrlError extends Error {
  constructor( { page, url }: PageUrlProps) {
    super(`La URL actual (${page.url()}) no coincide con la esperada (${url})`);
  }
}
