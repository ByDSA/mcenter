import { assertIsDefined } from "#shared/utils/validation";

export function getBackendUrl(): string {
  const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  assertIsDefined(envBackendUrl);

  const backendUrl = new URL(envBackendUrl);

  // get current hostname
  if (backendUrl.hostname === "localhost" && global.window !== undefined) {
    console.log("localhost detected, using",global.window.location.hostname);
    backendUrl.hostname = global.window.location.hostname;
  }

  let ret = backendUrl.toString();

  if (ret.endsWith("/"))
    ret = ret.slice(0, -1);

  return ret;
}