import { headers } from "next/headers";
import { initAcceptLanguageHeaderDetector } from "typesafe-i18n/detectors";
import { detectLocale, i18nObject } from "./i18n-util";

export async function i18nServerContext() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";
  const req = {
    headers: {
      get: () => acceptLanguage,
    },
  };
  const locale = detectLocale(
    initAcceptLanguageHeaderDetector(req),
  );

  return {
    locale,
    LL: i18nObject(locale),
  };
}
