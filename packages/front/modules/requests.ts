import { assertIsDefined } from "$shared/utils/validation";

const rootBackendUrl = getRootBackendUrl();

function getRootBackendUrl(): string {
  const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  assertIsDefined(envBackendUrl);

  const backendRootUrl = new URL(envBackendUrl);

  // get current hostname
  if (backendRootUrl.hostname === "localhost" && global.window !== undefined)
    backendRootUrl.hostname = global.window.location.hostname;

  let ret = backendRootUrl.toString();

  if (ret.endsWith("/"))
    ret = ret.slice(0, -1);

  return ret;
}

export function backendUrl(path: string) {
  return `${rootBackendUrl}${path}`;
}
